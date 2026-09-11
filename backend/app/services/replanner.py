import math
from typing import List, Dict, Any, Optional, Tuple
from app.services.path_planner import PathPlanner
from app.ml.predict import get_risk_predictor
from app.config import DEFAULT_RISK_HIGH_THRESHOLD, WEATHER_ENERGY_FACTORS

class PredictiveReplanner:
    def __init__(self, path_planner: PathPlanner):
        self.path_planner = path_planner
        self.risk_predictor = get_risk_predictor()

    def evaluate_and_replan(
        self,
        uavs: List[Dict[str, Any]],
        tasks: List[Dict[str, Any]],
        obstacles: List[Dict[str, Any]],
        weather: str = "NORMAL",
        risk_threshold: float = DEFAULT_RISK_HIGH_THRESHOLD
    ) -> Dict[str, Any]:
        """
        Evaluates robot fleet condition.
        If a robot's charger is down (battery < 28%) or failure risk is HIGH:
        Immediately identifies the NEAREST FREE robot, reassigns the task immediately,
        sends the low-charger robot back to dock, and generates notification.
        """
        replanning_events = []
        tasks_map = {t["id"]: t for t in tasks}
        
        # Check active robots executing tasks
        for uav in uavs:
            if uav.get("status") in ["ASSIGNED", "EN_ROUTE", "EXECUTING"] and uav.get("current_task_id"):
                task_id = uav["current_task_id"]
                task = tasks_map.get(task_id)
                if not task or task.get("status") == "COMPLETED":
                    continue
                
                curr_pos = (uav.get("x", 0.0), uav.get("y", 0.0))
                task_pos = (task.get("x", 0.0), task.get("y", 0.0))
                base_pos = (uav.get("base_x", 0.0), uav.get("base_y", 0.0))
                
                # Remaining route distance
                rem_route = self.path_planner.find_path(curr_pos, task_pos, obstacles)
                rem_metrics = self.path_planner.calculate_path_metrics(
                    rem_route, speed=uav.get("speed", 1.0), weather=weather
                )
                
                dist_to_base = math.hypot(task_pos[0] - base_pos[0], task_pos[1] - base_pos[1])
                weather_factor = WEATHER_ENERGY_FACTORS.get(weather, 1.0)
                energy_to_base = dist_to_base * 0.55 * weather_factor
                total_energy_req = rem_metrics["energy_required"] + energy_to_base
                
                # Predict ML failure risk
                risk_res = self.risk_predictor.predict_risk(
                    battery_percentage=uav.get("battery", 100.0),
                    distance_to_task=rem_metrics["distance"],
                    distance_to_base=dist_to_base,
                    uav_health=uav.get("health", 100.0),
                    communication_quality=uav.get("communication", 100.0),
                    speed=uav.get("speed", 1.0),
                    task_priority=task.get("priority", 3),
                    estimated_energy_required=total_energy_req,
                    weather_factor=weather_factor
                )
                
                current_risk_prob = risk_res["risk_probability"]
                is_charger_down = uav.get("battery", 0) < 28.0
                is_high_risk = current_risk_prob >= risk_threshold or is_charger_down
                
                if is_high_risk:
                    # Search for the NEAREST FREE robot
                    candidate_robot = self._find_nearest_free_robot(
                        exclude_id=uav["id"],
                        target_task=task,
                        uavs=uavs,
                        obstacles=obstacles,
                        weather=weather
                    )
                    
                    if candidate_robot:
                        alt_robot, alt_route, alt_metrics, alt_dist = candidate_robot
                        
                        is_predictive = current_risk_prob >= risk_threshold and not is_charger_down
                        title_prefix = "⚠️ PREDICTED FAILURE RISK" if is_predictive else "⚡ Charger Down"
                        
                        reason_str = (
                            f"Robot {uav['id']} high risk detected ({current_risk_prob:.1f}%, Battery: {uav.get('battery', 0):.1f}%). "
                            f"Preventive reassignment to nearest free robot {alt_robot['id']} "
                            f"(Distance: {alt_dist:.1f} units, Charger: {alt_robot.get('battery', 100):.1f}%)."
                        )
                        
                        event = {
                            "type": "PREDICTIVE_REPLANNING",
                            "title": f"{title_prefix}: {uav['id']} ➔ {alt_robot['id']}",
                            "task_id": task["id"],
                            "task_name": task["name"],
                            "old_uav_id": uav["id"],
                            "old_uav_risk": current_risk_prob,
                            "old_uav_battery": round(uav.get("battery", 0), 1),
                            "new_uav_id": alt_robot["id"],
                            "new_uav_risk": 15.0,
                            "new_uav_battery": round(alt_robot.get("battery", 100), 1),
                            "distance_to_task": round(alt_dist, 1),
                            "predicted_failure_minutes": risk_res.get("predicted_failure_minutes", 2.8),
                            "reason": reason_str,
                            "old_feature_contributions": risk_res["feature_contributions"],
                            "new_route": alt_route,
                            "new_metrics": alt_metrics,
                            "timestamp_desc": "Preventive nearest-free robot dispatch."
                        }
                        
                        # 1. Low charger robot safely heads back to charger dock
                        uav["current_task_id"] = None
                        uav["status"] = "RETURNING"
                        return_route = self.path_planner.find_path(curr_pos, base_pos, obstacles)
                        uav["route"] = return_route
                        uav["route_index"] = 0
                        uav["target_x"] = base_pos[0]
                        uav["target_y"] = base_pos[1]
                        
                        # 2. Nearest free robot takes over immediately
                        alt_robot["current_task_id"] = task["id"]
                        alt_robot["status"] = "EN_ROUTE"
                        alt_robot["route"] = alt_route
                        alt_robot["route_index"] = 0
                        alt_robot["target_x"] = task["x"]
                        alt_robot["target_y"] = task["y"]
                        
                        # 3. Update task
                        task["assigned_uav_id"] = alt_robot["id"]
                        task["status"] = "REASSIGNED"
                        
                        replanning_events.append(event)
                        
        return {
            "replanning_occurred": len(replanning_events) > 0,
            "events": replanning_events
        }

    def _find_nearest_free_robot(
        self,
        exclude_id: str,
        target_task: Dict[str, Any],
        uavs: List[Dict[str, Any]],
        obstacles: List[Dict[str, Any]],
        weather: str
    ) -> Optional[Tuple[Dict[str, Any], List[Tuple[float, float]], Dict[str, Any], float]]:
        """
        Finds the NEAREST robot that is FREE (IDLE, AVAILABLE, or returning)
        with sufficient charger reserve (> 35%).
        """
        best_cand = None
        min_distance = float("inf")
        best_route = []
        best_metrics = {}
        
        task_pos = (target_task.get("x", 0.0), target_task.get("y", 0.0))
        
        for cand in uavs:
            if cand["id"] == exclude_id:
                continue
            # Must be free/available and have healthy charger
            if cand.get("status") not in ["IDLE", "AVAILABLE", "RETURNING"]:
                continue
            if cand.get("battery", 0) < 35.0 or cand.get("health", 0) < 30.0:
                continue
                
            cand_pos = (cand.get("x", 0.0), cand.get("y", 0.0))
            
            # Calculate A* distance from this free robot to the task
            route = self.path_planner.find_path(cand_pos, task_pos, obstacles)
            metrics = self.path_planner.calculate_path_metrics(
                route, speed=cand.get("speed", 1.0), weather=weather
            )
            
            dist = metrics["distance"]
            
            # We prioritize closest/nearest free robot with best charger
            score = dist * 1.0 - (cand.get("battery", 100) * 0.05)
            
            if score < min_distance:
                min_distance = score
                best_cand = cand
                best_route = route
                best_metrics = metrics
                
        if best_cand is not None:
            return (best_cand, best_route, best_metrics, best_metrics["distance"])
        return None
