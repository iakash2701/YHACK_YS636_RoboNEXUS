from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
from app.ml.predict import get_risk_predictor
from app.ml.train import train_and_save_risk_model
from app.config import WEATHER_ENERGY_FACTORS

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

@router.get("/metrics", response_model=Dict[str, Any])
def get_ml_metrics():
    predictor = get_risk_predictor()
    return predictor.metrics

@router.post("/predict", response_model=Dict[str, Any])
def predict_uav_risk(payload: Dict[str, Any] = Body(...)):
    battery = float(payload.get("battery_percentage", 100.0))
    dist_task = float(payload.get("distance_to_task", 10.0))
    dist_base = float(payload.get("distance_to_base", 10.0))
    health = float(payload.get("uav_health", 100.0))
    comm = float(payload.get("communication_quality", 100.0))
    speed = float(payload.get("speed", 1.0))
    priority = int(payload.get("task_priority", 3))
    weather = payload.get("weather", "NORMAL")
    weather_factor = WEATHER_ENERGY_FACTORS.get(weather, 1.0)
    
    total_energy = float(payload.get("estimated_energy_required", (dist_task + 0.7 * dist_base) * 0.55 * weather_factor))
    
    predictor = get_risk_predictor()
    return predictor.predict_risk(
        battery_percentage=battery,
        distance_to_task=dist_task,
        distance_to_base=dist_base,
        uav_health=health,
        communication_quality=comm,
        speed=speed,
        task_priority=priority,
        estimated_energy_required=total_energy,
        weather_factor=weather_factor
    )

@router.post("/retrain", response_model=Dict[str, Any])
def retrain_model(num_samples: int = 8000):
    metrics = train_and_save_risk_model(num_samples=num_samples)
    return {"status": "SUCCESS", "message": f"Trained Random Forest on {num_samples} synthetic simulation samples", "metrics": metrics}
