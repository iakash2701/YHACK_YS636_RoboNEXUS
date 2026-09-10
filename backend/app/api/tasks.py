import uuid
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.database import execute_query, fetch_all, fetch_one
from app.schemas.mission_schema import TaskCreate, TaskResponse
from app.services.simulator import get_simulation_engine

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[Dict[str, Any]])
def list_tasks(mission_id: Optional[str] = None):
    sim = get_simulation_engine()
    if mission_id and mission_id in sim.active_missions:
        return sim.active_missions[mission_id]["tasks"]
        
    if mission_id:
        rows = fetch_all("SELECT * FROM tasks WHERE mission_id = ?", (mission_id,))
    else:
        rows = fetch_all("SELECT * FROM tasks")
    return [dict(r) for r in rows]

@router.post("", response_model=Dict[str, Any])
def create_task(task: TaskCreate, mission_id: str):
    task_id = f"TASK-{uuid.uuid4().hex[:4].upper()}"
    execute_query("""
    INSERT INTO tasks (id, mission_id, name, x, y, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
    """, (task_id, mission_id, task.name, task.x, task.y, task.priority))
    
    sim = get_simulation_engine()
    if mission_id in sim.active_missions:
        sim.init_mission_state(mission_id)
        
    sim.log_event(
        mission_id, "TASK_ADDED",
        f"Task Created: {task.name}",
        f"Added target at coordinates ({task.x}, {task.y}) with priority {task.priority}."
    )
    
    return {"id": task_id, "mission_id": mission_id, "name": task.name, "x": task.x, "y": task.y, "priority": task.priority, "status": "PENDING"}

@router.delete("/{task_id}")
def delete_task(task_id: str, mission_id: str):
    execute_query("DELETE FROM tasks WHERE id = ? AND mission_id = ?", (task_id, mission_id))
    sim = get_simulation_engine()
    if mission_id in sim.active_missions:
        sim.init_mission_state(mission_id)
    return {"success": True, "deleted_task_id": task_id}
