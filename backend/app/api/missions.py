import json
import uuid
import time
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.database import execute_query, fetch_all, fetch_one
from app.schemas.mission_schema import MissionCreate, MissionResponse, Obstacle, UAVResponse, TaskResponse
from app.services.simulator import get_simulation_engine
from app.services.baseline_comparator import get_baseline_comparator

router = APIRouter(prefix="/api/missions", tags=["Missions"])

DEFAULT_DEMO_OBSTACLES = [
    {"id": "OBS-01", "x": 18, "y": 8, "width": 8, "height": 16},
    {"id": "OBS-02", "x": 26, "y": 28, "width": 10, "height": 12},
    {"id": "OBS-03", "x": 8, "y": 24, "width": 6, "height": 10}
]

DEFAULT_DEMO_UAVS = [
    {"id": "UAV-01", "x": 2.0, "y": 2.0, "base_x": 2.0, "base_y": 2.0, "battery": 45.0, "health": 92.0, "communication": 88.0, "speed": 1.0},
    {"id": "UAV-02", "x": 10.0, "y": 5.0, "base_x": 10.0, "base_y": 5.0, "battery": 90.0, "health": 98.0, "communication": 95.0, "speed": 1.2},
    {"id": "UAV-03", "x": 5.0, "y": 10.0, "base_x": 5.0, "base_y": 10.0, "battery": 70.0, "health": 85.0, "communication": 90.0, "speed": 1.0}
]

DEFAULT_DEMO_TASKS = [
    {"id": "TASK-01", "name": "Inspect Area A", "x": 30.0, "y": 20.0, "priority": 5},
    {"id": "TASK-02", "name": "Inspect Area B", "x": 15.0, "y": 35.0, "priority": 4},
    {"id": "TASK-03", "name": "Monitor Area C", "x": 40.0, "y": 40.0, "priority": 3}
]

@router.get("", response_model=List[Dict[str, Any]])
def list_missions():
    missions = fetch_all("SELECT * FROM missions ORDER BY created_at DESC")
    results = []
    for m in missions:
        m_dict = dict(m)
        m_dict["obstacles"] = json.loads(m_dict["obstacles_json"]) if m_dict.get("obstacles_json") else []
        results.append(m_dict)
    return results

@router.post("", response_model=Dict[str, Any])
def create_mission(mission_data: MissionCreate):
    mission_id = str(uuid.uuid4())[:8]
    obstacles = [o.dict() for o in mission_data.obstacles] if mission_data.obstacles else DEFAULT_DEMO_OBSTACLES
    
    execute_query("""
    INSERT INTO missions (id, name, status, weather, map_width, map_height, obstacles_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (mission_id, mission_data.name, "CONFIGURED", mission_data.weather, mission_data.map_width, mission_data.map_height, json.dumps(obstacles)))
    
    # UAV creation
    uav_list = [u.dict() for u in mission_data.uavs] if mission_data.uavs else DEFAULT_DEMO_UAVS
    for u in uav_list:
        base_x = u.get("base_x", u.get("x", 0.0))
        base_y = u.get("base_y", u.get("y", 0.0))
        execute_query("""
        INSERT OR REPLACE INTO uavs (id, mission_id, x, y, base_x, base_y, battery, health, communication, speed, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'IDLE')
        """, (u["id"], mission_id, u["x"], u["y"], base_x, base_y, u.get("battery", 100.0), u.get("health", 100.0), u.get("communication", 100.0), u.get("speed", 1.0)))
        
    # Task creation
    task_list = [t.dict() for t in mission_data.tasks] if mission_data.tasks else DEFAULT_DEMO_TASKS
    for t in task_list:
        t_id = t.get("id", f"TASK-{uuid.uuid4().hex[:4].upper()}")
        execute_query("""
        INSERT OR REPLACE INTO tasks (id, mission_id, name, x, y, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
        """, (t_id, mission_id, t["name"], t["x"], t["y"], t.get("priority", 3)))
        
    sim = get_simulation_engine()
    sim.log_event(
        mission_id, "MISSION_CREATED",
        f"Mission Created: {mission_data.name}",
        f"Initialized with {len(uav_list)} UAVs, {len(task_list)} tasks, and {len(obstacles)} obstacle zones."
    )
    
    return sim.init_mission_state(mission_id)

@router.get("/{mission_id}/status", response_model=Dict[str, Any])
def get_mission_status(mission_id: str):
    sim = get_simulation_engine()
    try:
        state = sim.get_mission_state(mission_id)
        return state
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{mission_id}/plan", response_model=Dict[str, Any])
def plan_mission_endpoint(mission_id: str):
    sim = get_simulation_engine()
    try:
        return sim.plan_mission(mission_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{mission_id}/start", response_model=Dict[str, Any])
def start_mission_endpoint(mission_id: str):
    sim = get_simulation_engine()
    state = sim.get_mission_state(mission_id)
    if state["status"] == "CONFIGURED":
        sim.plan_mission(mission_id)
    state["status"] = "RUNNING"
    sim.log_event(mission_id, "SIMULATION_STARTED", "Simulation Started", "Autonomous multi-UAV mission execution in progress.")
    return state

@router.post("/{mission_id}/pause", response_model=Dict[str, Any])
def pause_mission_endpoint(mission_id: str):
    sim = get_simulation_engine()
    state = sim.get_mission_state(mission_id)
    state["status"] = "PAUSED"
    sim.log_event(mission_id, "SIMULATION_PAUSED", "Simulation Paused", "Mission execution temporarily suspended.")
    return state

@router.post("/{mission_id}/reset", response_model=Dict[str, Any])
def reset_mission_endpoint(mission_id: str):
    sim = get_simulation_engine()
    return sim.reset_mission(mission_id)

@router.post("/{mission_id}/replan", response_model=Dict[str, Any])
def manual_replan_endpoint(mission_id: str):
    sim = get_simulation_engine()
    state = sim.get_mission_state(mission_id)
    res = sim.replanner.evaluate_and_replan(
        uavs=state["uavs"],
        tasks=state["tasks"],
        obstacles=state["obstacles"],
        weather=state["weather"],
        risk_threshold=40.0  # Allow lower threshold for manual re-evaluation
    )
    if res["replanning_occurred"]:
        for evt in res["events"]:
            sim.log_event(mission_id, "PREDICTIVE_REPLANNING", evt["title"], evt["reason"], evt)
    sim._sync_state_to_db(mission_id)
    return state

@router.get("/{mission_id}/compare", response_model=Dict[str, Any])
def compare_mission_endpoint(mission_id: str):
    sim = get_simulation_engine()
    state = sim.get_mission_state(mission_id)
    comparator = get_baseline_comparator()
    return comparator.run_comparison(
        base_uavs=state["uavs"],
        base_tasks=state["tasks"],
        obstacles=state["obstacles"],
        weather=state["weather"]
    )
