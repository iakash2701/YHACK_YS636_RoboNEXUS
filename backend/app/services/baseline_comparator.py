import math
import copy
from typing import Dict, Any, List
from app.services.path_planner import PathPlanner
from app.services.task_allocator import TaskAllocator
from app.services.replanner import PredictiveReplanner
from app.ml.predict import get_risk_predictor
from app.config import WEATHER_ENERGY_FACTORS

class BaselineComparator:
    def __init__(self):
        self.path_planner = PathPlanner()
        self.task_allocator = TaskAllocator(self.path_planner)
        self.replanner = PredictiveReplanner(self.path_planner)
        self.risk_predictor = get_risk_predictor()

    def run_comparison(
        self,
        base_uavs: List[Dict[str, Any]],
        base_tasks: List[Dict[str, Any]],
        obstacles: List[Dict[str, Any]],
        weather: str = "NORMAL",
        inject_failure_step: int = 4
    ) -> Dict[str, Any]:
        """
        Runs dual simulated missions on the exact same mission configuration to empirically
        compare the Reactive Baseline Planner vs the Proposed Predictive Planner.
        """
        # 1. Simulate Reactive Mode
        reactive_results = self._simulate_mode(
            mode="REACTIVE",
            uavs=copy.deepcopy(base_uavs),
            tasks=copy.deepcopy(base_tasks),
            obstacles=obstacles,
            weather=weather,
            inject_failure_step=inject_failure_step
        )
        
        # 2. Simulate Predictive Mode
        predictive_results = self._simulate_mode(
            mode="PREDICTIVE",
            uavs=copy.deepcopy(base_uavs),
            tasks=copy.deepcopy(base_tasks),
            obstacles=obstacles,
            weather=weather,
            inject_failure_step=inject_failure_step
        )
        
        prevention_rate = 0.0
        if predictive_results["replanning_events"] > 0 or reactive_results["uav_failures"] > 0:
            prevented = max(0, reactive_results["uav_failures"] - predictive_results["uav_failures"])
            total_threats = max(1, reactive_results["uav_failures"])
            prevention_rate = round((prevented / total_threats) * 100.0, 1)
            
        return {
            "reactive": {
                "planner_mode": "Reactive Baseline (Post-Failure)",
                "completion_rate": reactive_results["completion_rate"],
                "tasks_completed": reactive_results["tasks_completed"],
                "total_tasks": reactive_results["total_tasks"],
                "uav_failures": reactive_results["uav_failures"],
                "prevented_failures": 0,
                "total_energy_consumed": reactive_results["total_energy_consumed"],
                "mission_duration_seconds": reactive_results["mission_duration_seconds"],
                "replanning_events": reactive_results["replanning_events"],
                "failure_prevention_rate": 0.0
            },
            "predictive": {
                "planner_mode": "Proposed Predictive (Self-Learning Risk-Aware)",
                "completion_rate": predictive_results["completion_rate"],
                "tasks_completed": predictive_results["tasks_completed"],
                "total_tasks": predictive_results["total_tasks"],
                "uav_failures": predictive_results["uav_failures"],
                "prevented_failures": predictive_results["prevented_failures"],
                "total_energy_consumed": predictive_results["total_energy_consumed"],
                "mission_duration_seconds": predictive_results["mission_duration_seconds"],
                "replanning_events": predictive_results["replanning_events"],
                "failure_prevention_rate": prevention_rate
            },
            "summary": {
                "completion_advantage": round(predictive_results["completion_rate"] - reactive_results["completion_rate"], 1),
                "energy_savings_pct": round(max(0.0, ((reactive_results["total_energy_consumed"] - predictive_results["total_energy_consumed"]) / max(1.0, reactive_results["total_energy_consumed"])) * 100.0), 1),
                "time_savings_seconds": round(max(0.0, reactive_results["mission_duration_seconds"] - predictive_results["mission_duration_seconds"]), 1),
                "failures_prevented": max(0, reactive_results["uav_failures"] - predictive_results["uav_failures"])
            }
        }

    def _simulate_mode(
        self,
        mode: str,
        uavs: List[Dict[str, Any]],
        tasks: List[Dict[str, Any]],
        obstacles: List[Dict[str, Any]],
        weather: str,
        inject_failure_step: int
    ) -> Dict[str, Any]:
        weather_factor = WEATHER_ENERGY_FACTORS.get(weather, 1.0)
        base_rate = 0.55
        
        # Initial Allocation
        assignments = self.task_allocator.allocate_tasks(uavs, tasks, obstacles, weather)
        uav_map = {u["id"]: u for u in uavs}
        task_map = {t["id"]: t for t in tasks}
        
        for assign in assignments:
            tid = assign["task_id"]
            uid = assign["uav_id"]
            task = task_map.get(tid)
            uav = uav_map.get(uid)
            if task and uav:
                task["status"] = "ASSIGNED"
                task["assigned_uav_id"] = uid
                uav["status"] = "ASSIGNED"
                uav["current_task_id"] = tid
                uav["route"] = assign["route"]
                uav["route_index"] = 0
                uav["target_x"] = task["x"]
                uav["target_y"] = task["y"]

        step = 0
        max_steps = 60
        uav_failures = 0
        prevented_failures = 0
        replanning_events = 0
        total_energy = 0.0

        while step < max_steps:
            step += 1
            
            # Simulated battery stress on UAV-01 at step 3 to trigger risk elevation
            if step == inject_failure_step:
                for u in uavs:
                    if u["id"] == "UAV-01" and u["status"] in ["ASSIGNED", "EN_ROUTE"]:
                        u["battery"] = 18.0  # severely reduced battery
            
            # Step movement
            for u in uavs:
                if u["status"] in ["ASSIGNED", "EN_ROUTE", "RETURNING"]:
                    route = u.get("route", [])
                    idx = u.get("route_index", 0)
                    if route and idx < len(route):
                        next_pt = route[idx]
                        u["x"] = next_pt[0]
                        u["y"] = next_pt[1]
                        u["route_index"] = idx + 1
                        
                        step_e = base_rate * weather_factor
                        u["battery"] = max(0.0, u["battery"] - step_e)
                        total_energy += step_e
                        
                        if u["status"] == "ASSIGNED":
                            u["status"] = "EN_ROUTE"
                            
                        if u["route_index"] >= len(route):
                            if u["status"] == "RETURNING":
                                u["status"] = "IDLE"
                                u["current_task_id"] = None
                            elif u.get("current_task_id"):
                                tid = u["current_task_id"]
                                t = task_map.get(tid)
                                if t and t["status"] != "COMPLETED":
                                    t["status"] = "COMPLETED"
                                    u["status"] = "RETURNING"
                                    base_pos = (u["base_x"], u["base_y"])
                                    u["route"] = self.path_planner.find_path((u["x"], u["y"]), base_pos, obstacles)
                                    u["route_index"] = 0
                                    u["current_task_id"] = None

                # Hard battery crash check
                if u["battery"] <= 0.0 and u["status"] != "FAILED":
                    u["status"] = "FAILED"
                    uav_failures += 1
                    
                    # Reactive Planner: ONLY responds after the failure occurs
                    if mode == "REACTIVE" and u.get("current_task_id"):
                        failed_tid = u["current_task_id"]
                        failed_task = task_map.get(failed_tid)
                        if failed_task and failed_task["status"] != "COMPLETED":
                            failed_task["status"] = "PENDING"
                            failed_task["assigned_uav_id"] = None
                            replanning_events += 1
                            # Re-allocate with remaining drones
                            avail = [cand for cand in uavs if cand["status"] in ["IDLE", "AVAILABLE"] and cand["battery"] > 25]
                            if avail:
                                new_assign = self.task_allocator.allocate_tasks(avail, [failed_task], obstacles, weather)
                                for na in new_assign:
                                    n_task = task_map.get(na["task_id"])
                                    n_uav = uav_map.get(na["uav_id"])
                                    if n_task and n_uav:
                                        n_task["status"] = "ASSIGNED"
                                        n_task["assigned_uav_id"] = n_uav["id"]
                                        n_uav["status"] = "ASSIGNED"
                                        n_uav["current_task_id"] = n_task["id"]
                                        n_uav["route"] = na["route"]
                                        n_uav["route_index"] = 0

            # Proposed Predictive Planner: Proactive evaluation BEFORE failure happens
            if mode == "PREDICTIVE":
                replan_res = self.replanner.evaluate_and_replan(
                    uavs=uavs,
                    tasks=tasks,
                    obstacles=obstacles,
                    weather=weather,
                    risk_threshold=70.0
                )
                if replan_res["replanning_occurred"]:
                    replanning_events += len(replan_res["events"])
                    prevented_failures += len(replan_res["events"])

            # Check if all completed
            if all(t["status"] == "COMPLETED" for t in tasks):
                break

        completed_tasks_count = sum(1 for t in tasks if t["status"] == "COMPLETED")
        completion_rate = round((completed_tasks_count / max(1, len(tasks))) * 100.0, 1)

        return {
            "completion_rate": completion_rate,
            "tasks_completed": completed_tasks_count,
            "total_tasks": len(tasks),
            "uav_failures": uav_failures,
            "prevented_failures": prevented_failures,
            "total_energy_consumed": round(total_energy, 2),
            "mission_duration_seconds": round(step * 1.5, 1),
            "replanning_events": replanning_events
        }

_comparator_instance = None

def get_baseline_comparator() -> BaselineComparator:
    global _comparator_instance
    if _comparator_instance is None:
        _comparator_instance = BaselineComparator()
    return _comparator_instance
