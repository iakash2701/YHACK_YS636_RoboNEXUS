from fastapi import APIRouter
from typing import List, Dict, Any, Optional
from app.database import fetch_all, fetch_one
from app.services.simulator import get_simulation_engine

router = APIRouter(prefix="/api", tags=["Analytics & Events"])

@router.get("/events", response_model=List[Dict[str, Any]])
def get_mission_events(mission_id: Optional[str] = None):
    sim = get_simulation_engine()
    if mission_id and mission_id in sim.active_missions:
        return sim.active_missions[mission_id]["recent_events"]
        
    if mission_id:
        rows = fetch_all("SELECT * FROM mission_events WHERE mission_id = ? ORDER BY id DESC LIMIT 50", (mission_id,))
    else:
        rows = fetch_all("SELECT * FROM mission_events ORDER BY id DESC LIMIT 50")
    return [dict(r) for r in rows]

@router.get("/analytics", response_model=Dict[str, Any])
def get_analytics(mission_id: Optional[str] = None):
    sim = get_simulation_engine()
    if mission_id and mission_id in sim.active_missions:
        state = sim.active_missions[mission_id]
        total_tasks = len(state["tasks"])
        completed_tasks = sum(1 for t in state["tasks"] if t["status"] == "COMPLETED")
        completion_rate = round((completed_tasks / max(1, total_tasks)) * 100.0, 1)
        
        avg_risk = round(sum(u.get("risk_probability", 0.0) for u in state["uavs"]) / max(1, len(state["uavs"])), 1)
        total_energy = round(sum(u.get("total_energy_consumed", 0.0) for u in state["uavs"]), 2)
        
        # Risk distribution
        high_risk_uavs = sum(1 for u in state["uavs"] if u.get("risk_level") == "HIGH")
        med_risk_uavs = sum(1 for u in state["uavs"] if u.get("risk_level") == "MEDIUM")
        low_risk_uavs = sum(1 for u in state["uavs"] if u.get("risk_level") == "LOW")
        
        return {
            "mission_id": mission_id,
            "completion_rate": completion_rate,
            "completed_tasks": completed_tasks,
            "total_tasks": total_tasks,
            "active_uavs": sum(1 for u in state["uavs"] if u["status"] in ["ASSIGNED", "EN_ROUTE", "RETURNING"]),
            "total_uavs": len(state["uavs"]),
            "average_risk": avg_risk,
            "total_energy_consumed": total_energy,
            "replanning_events": state["replanning_count"],
            "prevented_failures": state["prevented_failures"],
            "uav_failures": state["uav_failures"],
            "risk_breakdown": {
                "HIGH": high_risk_uavs,
                "MEDIUM": med_risk_uavs,
                "LOW": low_risk_uavs
            }
        }
        
    return {
        "completion_rate": 0.0,
        "completed_tasks": 0,
        "total_tasks": 0,
        "active_uavs": 0,
        "total_uavs": 0,
        "average_risk": 0.0,
        "total_energy_consumed": 0.0,
        "replanning_events": 0,
        "prevented_failures": 0,
        "uav_failures": 0,
        "risk_breakdown": {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    }
