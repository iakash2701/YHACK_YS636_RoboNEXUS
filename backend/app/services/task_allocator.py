import math
from typing import List, Dict, Any, Tuple, Optional
from app.services.path_planner import PathPlanner
from app.ml.predict import get_risk_predictor
from app.config import WEATHER_ENERGY_FACTORS

class TaskAllocator:
    def __init__(self, path_planner: PathPlanner):
        self.path_planner = path_planner
        self.risk_predictor = get_risk_predictor()

    def allocate_tasks(
        self,
        uavs: List[Dict[str, Any]],
        tasks: List[Dict[str, Any]],
        obstacles: List[Dict[str, Any]],
        weather: str = "NORMAL"
    ) -> List[Dict[str, Any]]:
        """
        Intelligent Weighted Assignment Algorithm:
        Assigns tasks to UAVs by evaluating multidimensional cost matrices:
        - Distance cost (A* path length)
        - ML Predicted failure risk cost
        - Estimated energy cost vs remaining battery
        - Task priority bonus
        
        Lower assignment_score = better fit.
        """
        available_uavs = [
            u for u in uavs 
            if u.get("status") in ["IDLE", "AVAILABLE", "RETURNING"] and u.get("battery", 0) > 20 and u.get("health", 0) > 20
        ]
        
        pending_tasks = [
            t for t in tasks 
            if t.get("status") in ["PENDING", "UNASSIGNED"]
        ]
        
        # Sort pending tasks by priority descending
        pending_tasks.sort(key=lambda t: t.get("priority", 3), reverse=True)
        
        assignments = []
        assigned_uav_ids = set()
        
        for task in pending_tasks:
            best_uav = None
            best_score = float("inf")
            best_route = []
            best_metrics = {}
            best_risk = {}
            
            task_pos = (task.get("x", 0.0), task.get("y", 0.0))
            priority = task.get("priority", 3)
            
            for uav in available_uavs:
                uav_id = uav["id"]
                if uav_id in assigned_uav_ids:
                    continue
                    
                uav_pos = (uav.get("x", 0.0), uav.get("y", 0.0))
                base_pos = (uav.get("base_x", uav.get("x", 0.0)), uav.get("base_y", uav.get("y", 0.0)))
                
                # 1. Calculate A* route to task
                route_to_task = self.path_planner.find_path(uav_pos, task_pos, obstacles)
                metrics = self.path_planner.calculate_path_metrics(
                    route_to_task, speed=uav.get("speed", 1.0), weather=weather
                )
                
                # 2. Calculate distance to base for return trip estimation
                dist_to_base = math.hypot(task_pos[0] - base_pos[0], task_pos[1] - base_pos[1])
                weather_factor = WEATHER_ENERGY_FACTORS.get(weather, 1.0)
                energy_to_base = dist_to_base * 0.55 * weather_factor
                total_energy_est = metrics["energy_required"] + energy_to_base
                
                # 3. Predict Failure Risk using ML Random Forest
                risk_res = self.risk_predictor.predict_risk(
                    battery_percentage=uav.get("battery", 100.0),
                    distance_to_task=metrics["distance"],
                    distance_to_base=dist_to_base,
                    uav_health=uav.get("health", 100.0),
                    communication_quality=uav.get("communication", 100.0),
                    speed=uav.get("speed", 1.0),
                    task_priority=priority,
                    estimated_energy_required=total_energy_est,
                    weather_factor=weather_factor
                )
                
                risk_prob = risk_res["risk_probability"]
                
                # 4. Multi-objective Assignment Score
                # assignment_score = distance_cost + risk_cost + energy_cost - priority_bonus
                distance_cost = metrics["distance"] * 1.0
                risk_cost = (risk_prob ** 1.3) * 1.8  # Non-linear penalty for higher risk
                energy_cost = (total_energy_est / max(1.0, uav.get("battery", 100.0))) * 60.0
                priority_bonus = priority * 8.0
                
                assignment_score = distance_cost + risk_cost + energy_cost - priority_bonus
                
                # If UAV cannot even reach the destination with reserve, penalize heavily
                if uav.get("battery", 0) < (total_energy_est + 10.0):
                    assignment_score += 500.0
                
                if assignment_score < best_score:
                    best_score = assignment_score
                    best_uav = uav
                    best_route = route_to_task
                    best_metrics = metrics
                    best_risk = risk_res
            
            if best_uav is not None:
                assigned_uav_ids.add(best_uav["id"])
                assignments.append({
                    "task_id": task["id"],
                    "uav_id": best_uav["id"],
                    "assignment_score": round(best_score, 2),
                    "route": best_route,
                    "metrics": best_metrics,
                    "risk": best_risk
                })
                
        return assignments
