from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.database import execute_query, fetch_all, fetch_one
from app.schemas.mission_schema import UAVCreate, UAVResponse
from app.services.simulator import get_simulation_engine

router = APIRouter(prefix="/api/uavs", tags=["UAVs"])

@router.get("", response_model=List[Dict[str, Any]])
def list_uavs(mission_id: Optional[str] = None):
    sim = get_simulation_engine()
    if mission_id and mission_id in sim.active_missions:
        return sim.active_missions[mission_id]["uavs"]
        
    if mission_id:
        rows = fetch_all("SELECT * FROM uavs WHERE mission_id = ?", (mission_id,))
    else:
        rows = fetch_all("SELECT * FROM uavs")
    return [dict(r) for r in rows]

@router.post("", response_model=Dict[str, Any])
def create_or_update_uav(uav: UAVCreate, mission_id: Optional[str] = None):
    base_x = uav.base_x if uav.base_x is not None else uav.x
    base_y = uav.base_y if uav.base_y is not None else uav.y
    
    existing = fetch_one("SELECT * FROM uavs WHERE id = ? AND mission_id = ?", (uav.id, mission_id))
    if existing:
        execute_query("""
        UPDATE uavs 
        SET x = ?, y = ?, base_x = ?, base_y = ?, battery = ?, health = ?, communication = ?, speed = ?
        WHERE id = ? AND mission_id = ?
        """, (uav.x, uav.y, base_x, base_y, uav.battery, uav.health, uav.communication, uav.speed, uav.id, mission_id))
    else:
        execute_query("""
        INSERT INTO uavs (id, mission_id, x, y, base_x, base_y, battery, health, communication, speed, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'IDLE')
        """, (uav.id, mission_id, uav.x, uav.y, base_x, base_y, uav.battery, uav.health, uav.communication, uav.speed))
        
    sim = get_simulation_engine()
    if mission_id and mission_id in sim.active_missions:
        sim.init_mission_state(mission_id)
        
    return {"id": uav.id, "status": "SAVED", "x": uav.x, "y": uav.y, "battery": uav.battery}
