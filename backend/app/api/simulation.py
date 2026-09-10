from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
from app.services.simulator import get_simulation_engine
from app.schemas.mission_schema import Obstacle

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.post("/step", response_model=Dict[str, Any])
def step_simulation(payload: Dict[str, Any] = Body(...)):
    mission_id = payload.get("mission_id")
    if not mission_id:
        raise HTTPException(status_code=400, detail="mission_id required")
    sim = get_simulation_engine()
    return sim.step_simulation(mission_id)

@router.post("/low-battery", response_model=Dict[str, Any])
def simulate_low_battery_endpoint(payload: Dict[str, Any] = Body(...)):
    mission_id = payload.get("mission_id")
    uav_id = payload.get("uav_id")
    battery = float(payload.get("battery", 24.0))
    if not mission_id or not uav_id:
        raise HTTPException(status_code=400, detail="mission_id and uav_id required")
    sim = get_simulation_engine()
    return sim.simulate_low_battery(mission_id, uav_id, battery)

@router.post("/communication-loss", response_model=Dict[str, Any])
def simulate_comm_loss_endpoint(payload: Dict[str, Any] = Body(...)):
    mission_id = payload.get("mission_id")
    uav_id = payload.get("uav_id")
    comm = float(payload.get("communication", 15.0))
    if not mission_id or not uav_id:
        raise HTTPException(status_code=400, detail="mission_id and uav_id required")
    sim = get_simulation_engine()
    return sim.simulate_communication_loss(mission_id, uav_id, comm)

@router.post("/failure", response_model=Dict[str, Any])
def simulate_failure_endpoint(payload: Dict[str, Any] = Body(...)):
    mission_id = payload.get("mission_id")
    uav_id = payload.get("uav_id")
    if not mission_id or not uav_id:
        raise HTTPException(status_code=400, detail="mission_id and uav_id required")
    sim = get_simulation_engine()
    return sim.simulate_uav_failure(mission_id, uav_id)

@router.post("/weather", response_model=Dict[str, Any])
def simulate_weather_endpoint(payload: Dict[str, Any] = Body(...)):
    mission_id = payload.get("mission_id")
    weather = payload.get("weather", "NORMAL")
    if not mission_id:
        raise HTTPException(status_code=400, detail="mission_id required")
    sim = get_simulation_engine()
    return sim.simulate_weather_change(mission_id, weather)

@router.post("/obstacle", response_model=Dict[str, Any])
def simulate_obstacle_endpoint(payload: Dict[str, Any] = Body(...)):
    mission_id = payload.get("mission_id")
    obstacle = payload.get("obstacle")
    if not mission_id or not obstacle:
        raise HTTPException(status_code=400, detail="mission_id and obstacle required")
    sim = get_simulation_engine()
    return sim.simulate_obstacle(mission_id, obstacle)
