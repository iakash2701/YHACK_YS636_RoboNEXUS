import time
import json
import math
import copy
from typing import List, Dict, Any, Optional
from app.services.path_planner import PathPlanner
from app.services.task_allocator import TaskAllocator
from app.services.replanner import PredictiveReplanner
from app.ml.predict import get_risk_predictor
from app.config import (
    WEATHER_ENERGY_FACTORS,
    DEFAULT_BATTERY_CRITICAL_THRESHOLD,
    DEFAULT_RISK_HIGH_THRESHOLD,
    DEFAULT_RISK_MEDIUM_THRESHOLD
)
from app.database import execute_query, fetch_all, fetch_one

class SimulationEngine:
    def __init__(self):
        self.path_planner = PathPlanner()
        self.task_allocator = TaskAllocator(self.path_planner)
        self.replanner = PredictiveReplanner(self.path_planner)
        self.risk_predictor = get_risk_predictor()
        
        # In-memory active mission state cache for ultra-fast, smooth real-time simulation
        self.active_missions: Dict[str, Dict[str, Any]] = {}

    def init_mission_state(self, mission_id: str) -> Dict[str, Any]:
        """Loads or initializes mission state from SQLite."""
        mission = fetch_one("SELECT * FROM missions WHERE id = ?", (mission_id,))
        if not mission:
            raise ValueError(f"Mission {mission_id} not found")
            
        uavs_db = fetch_all("SELECT * FROM uavs WHERE mission_id = ?", (mission_id,))
        tasks_db = fetch_all("SELECT * FROM tasks WHERE mission_id = ?", (mission_id,))
        
        obstacles = json.loads(mission["obstacles_json"]) if mission.get("obstacles_json") else []
        
        uavs = []
        for u in uavs_db:
            route = json.loads(u["route_json"]) if u.get("route_json") else []
            uav_dict = dict(u)
            uav_dict["route"] = route
            uavs.append(uav_dict)
            
        tasks = [dict(t) for t in tasks_db]
        
        state = {
            "mission": dict(mission),
            "uavs": uavs,
            "tasks": tasks,
            "obstacles": obstacles,
            "weather": mission.get("weather", "NORMAL"),
            "status": mission.get("status", "CONFIGURED"),
            "step_count": 0,
            "replanning_count": 0,
            "prevented_failures": 0,
            "uav_failures": 0,
            "start_time": time.time(),
            "elapsed_seconds": 0.0,
            "recent_events": [],
            "last_replanning_event": None
        }
        
        self.active_missions[mission_id] = state
        return state

    def get_mission_state(self, mission_id: str) -> Dict[str, Any]:
        if mission_id not in self.active_missions:
            return self.init_mission_state(mission_id)
        return self.active_missions[mission_id]

    def plan_mission(self, mission_id: str) -> Dict[str, Any]:
        """
        Executes Sense -> Predict -> Decide pipeline:
        1. Task allocation with ML risk weighting
        2. A* route generation
        3. Initial failure risk prediction
        """
        state = self.get_mission_state(mission_id)
        uavs = state["uavs"]
        tasks = state["tasks"]
        obstacles = state["obstacles"]
        weather = state["weather"]
        
        # 1. Run Intelligent Task Allocation
        assignments = self.task_allocator.allocate_tasks(uavs, tasks, obstacles, weather)
        
        uav_map = {u["id"]: u for u in uavs}
        task_map = {t["id"]: t for t in tasks}
        
        for assign in assignments:
            tid = assign["task_id"]
            uid = assign["uav_id"]
            route = assign["route"]
            metrics = assign["metrics"]
            risk_res = assign["risk"]
            
            task = task_map.get(tid)
            uav = uav_map.get(uid)
            
            if task and uav:
                task["status"] = "ASSIGNED"
                task["assigned_uav_id"] = uid
                
                uav["status"] = "ASSIGNED"
                uav["current_task_id"] = tid
                uav["route"] = route
                uav["route_index"] = 0
                uav["target_x"] = task["x"]
                uav["target_y"] = task["y"]
                uav["risk_level"] = risk_res["risk_level"]
                uav["risk_probability"] = risk_res["risk_probability"]
                
                # Log assignment in DB
                execute_query("""
                INSERT INTO assignments (mission_id, task_id, uav_id, assignment_score, status)
                VALUES (?, ?, ?, ?, ?)
                """, (mission_id, tid, uid, assign["assignment_score"], "ACTIVE"))
                
                self.log_event(
                    mission_id, "TASK_ASSIGNED",
                    f"Task {task['name']} Assigned",
                    f"Assigned to {uav['id']} (Route distance: {metrics['distance']} units, Initial Risk: {risk_res['risk_probability']}%)",
                    {"task_id": tid, "uav_id": uid, "score": assign["assignment_score"]}
                )

        state["status"] = "PLANNED"
        self._sync_state_to_db(mission_id)
        return state

    def step_simulation(self, mission_id: str) -> Dict[str, Any]:
        """
        Single atomic tick/step in the simulation:
        1. Moves UAVs along calculated A* routes.
        2. Consumes energy based on distance and weather.
        3. Evaluates real-time failure risk using ML.
        4. Triggers Predictive Replanning if risk threshold breached.
        5. Updates task completion when waypoints reached.
        """
        state = self.get_mission_state(mission_id)
        if state["status"] not in ["RUNNING", "PLANNED", "ACTIVE"]:
            return state

        state["status"] = "RUNNING"
        state["step_count"] += 1
        state["elapsed_seconds"] += 1.0
        
        weather = state["weather"]
        weather_factor = WEATHER_ENERGY_FACTORS.get(weather, 1.0)
        base_rate = 0.55
        
        uavs = state["uavs"]
        tasks = state["tasks"]
        obstacles = state["obstacles"]
        
        tasks_map = {t["id"]: t for t in tasks}
        replanning_triggered = False

        # --- STEP 1: MOVE ACTIVE UAVS & DECREASE BATTERY ---
        for uav in uavs:
            if uav["status"] in ["ASSIGNED", "EN_ROUTE", "RETURNING"]:
                route = uav.get("route", [])
                idx = uav.get("route_index", 0)
                
                if route and idx < len(route):
                    # Move to next waypoint
                    next_point = route[idx]
                    uav["x"] = round(float(next_point[0]), 2)
                    uav["y"] = round(float(next_point[1]), 2)
                    uav["route_index"] = idx + 1
                    
                    # Energy consumption per step
                    step_energy = base_rate * weather_factor * uav.get("speed", 1.0)
                    uav["battery"] = max(0.0, round(uav["battery"] - step_energy, 2))
                    uav["total_energy_consumed"] = round(uav.get("total_energy_consumed", 0.0) + step_energy, 2)
                    
                    if uav["status"] == "ASSIGNED":
                        uav["status"] = "EN_ROUTE"

                    # Check if destination reached
                    if uav["route_index"] >= len(route):
                        if uav["status"] == "RETURNING":
                            uav["status"] = "IDLE"
                            uav["current_task_id"] = None
                            self.log_event(
                                mission_id, "UAV_RETURNED",
                                f"{uav['id']} Returned to Base",
                                f"{uav['id']} safely docked at base station ({uav['base_x']}, {uav['base_y']}) with {uav['battery']}% battery."
                            )
                        elif uav.get("current_task_id"):
                            tid = uav["current_task_id"]
                            task = tasks_map.get(tid)
                            if task and task["status"] != "COMPLETED":
                                task["status"] = "COMPLETED"
                                task["completed_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
                                self.log_event(
                                    mission_id, "TASK_COMPLETED",
                                    f"Task Completed: {task['name']}",
                                    f"{uav['id']} completed task {task['name']} successfully."
                                )
                                # Send UAV back to base
                                base_pos = (uav.get("base_x", 0.0), uav.get("base_y", 0.0))
                                ret_route = self.path_planner.find_path((uav["x"], uav["y"]), base_pos, obstacles)
                                uav["route"] = ret_route
                                uav["route_index"] = 0
                                uav["status"] = "RETURNING"
                                uav["target_x"] = base_pos[0]
                                uav["target_y"] = base_pos[1]
                                uav["current_task_id"] = None

            # Check for critical UAV failure condition (reactive threshold)
            if uav["battery"] <= 0.0 or uav["health"] <= 10.0:
                if uav["status"] != "FAILED":
                    uav["status"] = "FAILED"
                    state["uav_failures"] += 1
                    self.log_event(
                        mission_id, "UAV_FAILED",
                        f"CRITICAL: {uav['id']} System Failure",
                        f"{uav['id']} depleted battery or sustained catastrophic failure at ({uav['x']}, {uav['y']})."
                    )

        # --- STEP 2: ML RISK RE-EVALUATION FOR ALL UAVS ---
        for uav in uavs:
            if uav["status"] in ["EN_ROUTE", "ASSIGNED", "EXECUTING"] and uav.get("current_task_id"):
                task = tasks_map.get(uav["current_task_id"])
                if task:
                    task_pos = (task["x"], task["y"])
                    base_pos = (uav["base_x"], uav["base_y"])
                    rem_route = self.path_planner.find_path((uav["x"], uav["y"]), task_pos, obstacles)
                    rem_metrics = self.path_planner.calculate_path_metrics(
                        rem_route, speed=uav.get("speed", 1.0), weather=weather
                    )
                    dist_to_base = math.hypot(task["x"] - base_pos[0], task["y"] - base_pos[1])
                    energy_to_base = dist_to_base * 0.55 * weather_factor
                    total_energy_req = rem_metrics["energy_required"] + energy_to_base
                    
                    risk_res = self.risk_predictor.predict_risk(
                        battery_percentage=uav["battery"],
                        distance_to_task=rem_metrics["distance"],
                        distance_to_base=dist_to_base,
                        uav_health=uav["health"],
                        communication_quality=uav["communication"],
                        speed=uav.get("speed", 1.0),
                        task_priority=task.get("priority", 3),
                        estimated_energy_required=total_energy_req,
                        weather_factor=weather_factor
                    )
                    
                    uav["risk_probability"] = risk_res["risk_probability"]
                    uav["risk_level"] = risk_res["risk_level"]
                    uav["feature_contributions"] = risk_res["feature_contributions"]
                    
                    # Record risk prediction in DB
                    execute_query("""
                    INSERT INTO risk_predictions (mission_id, uav_id, task_id, risk_probability, risk_level, feature_contributions_json)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, (mission_id, uav["id"], task["id"], risk_res["risk_probability"], risk_res["risk_level"], json.dumps(risk_res["feature_contributions"])))
            elif uav["status"] == "IDLE":
                uav["risk_probability"] = 5.0
                uav["risk_level"] = "LOW"

        # --- STEP 3: PREDICTIVE REPLANNING TRIGGER ---
        replan_res = self.replanner.evaluate_and_replan(
            uavs=uavs,
            tasks=tasks,
            obstacles=obstacles,
            weather=weather,
            risk_threshold=DEFAULT_RISK_HIGH_THRESHOLD
        )
        
        if replan_res["replanning_occurred"]:
            replanning_triggered = True
            state["replanning_count"] += len(replan_res["events"])
            state["prevented_failures"] += len(replan_res["events"])
            
            for evt in replan_res["events"]:
                state["last_replanning_event"] = evt
                self.log_event(
                    mission_id,
                    "PREDICTIVE_REPLANNING",
                    evt["title"],
                    f"Reassigned {evt['task_name']} from {evt['old_uav_id']} (Risk: {evt['old_uav_risk']}%) to {evt['new_uav_id']} (New Risk: {evt['new_uav_risk']}%). Reason: {evt['reason']}",
                    evt
                )

        # Check if all tasks are completed
        all_completed = all(t["status"] == "COMPLETED" for t in tasks)
        if all_completed and state["status"] == "RUNNING":
            state["status"] = "COMPLETED"
            self.log_event(
                mission_id, "MISSION_COMPLETED",
                "Mission Successfully Completed",
                f"All {len(tasks)} tasks executed. Total replanning events: {state['replanning_count']}."
            )

        self._sync_state_to_db(mission_id)
        return state

    # --- WHAT-IF SIMULATION INJECTORS ---
    def simulate_low_battery(self, mission_id: str, uav_id: str, battery_value: float = 24.0) -> Dict[str, Any]:
        state = self.get_mission_state(mission_id)
        for u in state["uavs"]:
            if u["id"] == uav_id:
                u["battery"] = float(battery_value)
                self.log_event(
                    mission_id, "SIMULATE_LOW_BATTERY",
                    f"What-If Event: Low Battery on {uav_id}",
                    f"Injected battery drop on {uav_id} to {battery_value}%.",
                    {"uav_id": uav_id, "battery": battery_value}
                )
                break
        return self.step_simulation(mission_id)

    def simulate_communication_loss(self, mission_id: str, uav_id: str, comm_value: float = 15.0) -> Dict[str, Any]:
        state = self.get_mission_state(mission_id)
        for u in state["uavs"]:
            if u["id"] == uav_id:
                u["communication"] = float(comm_value)
                self.log_event(
                    mission_id, "SIMULATE_COMM_LOSS",
                    f"What-If Event: Comms Loss on {uav_id}",
                    f"Degraded communication telemetry for {uav_id} to {comm_value}%.",
                    {"uav_id": uav_id, "communication": comm_value}
                )
                break
        return self.step_simulation(mission_id)

    def simulate_uav_failure(self, mission_id: str, uav_id: str) -> Dict[str, Any]:
        state = self.get_mission_state(mission_id)
        for u in state["uavs"]:
            if u["id"] == uav_id:
                u["health"] = 0.0
                u["battery"] = 0.0
                u["status"] = "FAILED"
                state["uav_failures"] += 1
                self.log_event(
                    mission_id, "SIMULATE_FAILURE",
                    f"What-If Event: Hard Failure on {uav_id}",
                    f"Forced catastrophic hardware failure on {uav_id}.",
                    {"uav_id": uav_id}
                )
                break
        return self.step_simulation(mission_id)

    def simulate_weather_change(self, mission_id: str, new_weather: str) -> Dict[str, Any]:
        state = self.get_mission_state(mission_id)
        state["weather"] = new_weather
        execute_query("UPDATE missions SET weather = ? WHERE id = ?", (new_weather, mission_id))
        self.log_event(
            mission_id, "SIMULATE_WEATHER",
            f"What-If Event: Weather Changed to {new_weather}",
            f"Atmospheric environmental condition updated to {new_weather} (Energy multiplier: {WEATHER_ENERGY_FACTORS.get(new_weather, 1.0)}x).",
            {"weather": new_weather}
        )
        return self.step_simulation(mission_id)

    def simulate_obstacle(self, mission_id: str, obstacle: Dict[str, Any]) -> Dict[str, Any]:
        state = self.get_mission_state(mission_id)
        state["obstacles"].append(obstacle)
        execute_query("UPDATE missions SET obstacles_json = ? WHERE id = ?", (json.dumps(state["obstacles"]), mission_id))
        self.log_event(
            mission_id, "SIMULATE_OBSTACLE",
            f"What-If Event: Obstacle Injected at ({obstacle.get('x')}, {obstacle.get('y')})",
            f"New no-fly barrier created ({obstacle.get('width')}x{obstacle.get('height')}). Recalculating routes.",
            obstacle
        )
        # Recalculate routes for en-route UAVs
        for u in state["uavs"]:
            if u["status"] in ["EN_ROUTE", "ASSIGNED"] and u.get("target_x") is not None:
                new_route = self.path_planner.find_path(
                    (u["x"], u["y"]), (u["target_x"], u["target_y"]), state["obstacles"]
                )
                u["route"] = new_route
                u["route_index"] = 0
        return self.step_simulation(mission_id)

    def reset_mission(self, mission_id: str) -> Dict[str, Any]:
        """Resets mission to initial state."""
        # Re-fetch from DB or reset defaults
        execute_query("""
        UPDATE uavs 
        SET x = base_x, y = base_y, battery = 100.0, health = 100.0, communication = 100.0,
            status = 'IDLE', current_task_id = NULL, target_x = NULL, target_y = NULL,
            route_json = '[]', route_index = 0, total_energy_consumed = 0.0
        WHERE mission_id = ?
        """, (mission_id,))
        
        execute_query("""
        UPDATE tasks 
        SET status = 'PENDING', assigned_uav_id = NULL, completed_at = NULL
        WHERE mission_id = ?
        """, (mission_id,))
        
        execute_query("UPDATE missions SET status = 'CONFIGURED' WHERE id = ?", (mission_id,))
        execute_query("DELETE FROM mission_events WHERE mission_id = ?", (mission_id,))
        execute_query("DELETE FROM risk_predictions WHERE mission_id = ?", (mission_id,))
        execute_query("DELETE FROM assignments WHERE mission_id = ?", (mission_id,))
        
        if mission_id in self.active_missions:
            del self.active_missions[mission_id]
            
        state = self.init_mission_state(mission_id)
        self.log_event(
            mission_id, "SYSTEM_RESET",
            "Simulation System Reset",
            "Mission parameters, UAV positions, battery levels, and event timeline restored to baseline."
        )
        return state

    def log_event(self, mission_id: str, event_type: str, title: str, description: str, details: Optional[Dict[str, Any]] = None) -> None:
        details_str = json.dumps(details) if details else None
        execute_query("""
        INSERT INTO mission_events (mission_id, event_type, title, description, details_json)
        VALUES (?, ?, ?, ?, ?)
        """, (mission_id, event_type, title, description, details_str))
        
        event_dict = {
            "mission_id": mission_id,
            "event_type": event_type,
            "title": title,
            "description": description,
            "details": details,
            "timestamp": time.strftime("%H:%M:%S")
        }
        
        if mission_id in self.active_missions:
            self.active_missions[mission_id]["recent_events"].insert(0, event_dict)
            if len(self.active_missions[mission_id]["recent_events"]) > 50:
                self.active_missions[mission_id]["recent_events"].pop()

    def _sync_state_to_db(self, mission_id: str) -> None:
        if mission_id not in self.active_missions:
            return
        state = self.active_missions[mission_id]
        
        execute_query("UPDATE missions SET status = ?, weather = ? WHERE id = ?", 
                      (state["status"], state["weather"], mission_id))
        
        for u in state["uavs"]:
            execute_query("""
            UPDATE uavs 
            SET x = ?, y = ?, battery = ?, health = ?, communication = ?, status = ?,
                current_task_id = ?, target_x = ?, target_y = ?, route_json = ?,
                route_index = ?, total_energy_consumed = ?
            WHERE id = ? AND mission_id = ?
            """, (
                u["x"], u["y"], u["battery"], u["health"], u["communication"], u["status"],
                u.get("current_task_id"), u.get("target_x"), u.get("target_y"),
                json.dumps(u.get("route", [])), u.get("route_index", 0), u.get("total_energy_consumed", 0.0),
                u["id"], mission_id
            ))
            
        for t in state["tasks"]:
            execute_query("""
            UPDATE tasks 
            SET status = ?, assigned_uav_id = ?, completed_at = ?
            WHERE id = ? AND mission_id = ?
            """, (t["status"], t.get("assigned_uav_id"), t.get("completed_at"), t["id"], mission_id))

_simulation_engine_instance = None

def get_simulation_engine() -> SimulationEngine:
    global _simulation_engine_instance
    if _simulation_engine_instance is None:
        _simulation_engine_instance = SimulationEngine()
    return _simulation_engine_instance
