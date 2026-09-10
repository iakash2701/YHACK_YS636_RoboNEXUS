import pytest
from app.ml.predict import get_risk_predictor
from app.ml.dataset import generate_synthetic_mission_dataset
from app.ml.train import train_and_save_risk_model

def test_dataset_generation():
    df = generate_synthetic_mission_dataset(num_samples=100)
    assert len(df) == 100
    assert "mission_failure" in df.columns
    assert "battery_percentage" in df.columns

def test_risk_predictor_high_and_low_scenarios():
    predictor = get_risk_predictor()
    
    # Safe Scenario
    safe_res = predictor.predict_risk(
        battery_percentage=95.0,
        distance_to_task=10.0,
        distance_to_base=10.0,
        uav_health=95.0,
        communication_quality=95.0,
        speed=1.0,
        task_priority=3,
        estimated_energy_required=10.0,
        weather_factor=1.0
    )
    assert safe_res["risk_level"] == "LOW"
    assert safe_res["risk_probability"] < 40.0
    assert "Battery level" in safe_res["feature_contributions"]
    
    # Dangerous Scenario (Low battery, long distance, poor health)
    danger_res = predictor.predict_risk(
        battery_percentage=22.0,
        distance_to_task=50.0,
        distance_to_base=50.0,
        uav_health=35.0,
        communication_quality=25.0,
        speed=1.0,
        task_priority=5,
        estimated_energy_required=55.0,
        weather_factor=1.60
    )
    assert danger_res["risk_level"] == "HIGH"
    assert danger_res["risk_probability"] >= 70.0
    assert "CRITICAL" in danger_res["recommendation"]
