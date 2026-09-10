import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "RandomForestClassifier" in data["ai_risk_engine"]

def test_ml_metrics_endpoint():
    response = client.get("/api/ml/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data
    assert "roc_auc" in data

def test_mission_lifecycle_flow():
    # 1. Create Mission
    create_res = client.post("/api/missions", json={
        "name": "Integration Test Mission",
        "weather": "NORMAL",
        "map_width": 50,
        "map_height": 50
    })
    assert create_res.status_code == 200
    mission_id = create_res.json()["mission"]["id"]
    
    # 2. Plan Mission
    plan_res = client.post(f"/api/missions/{mission_id}/plan")
    assert plan_res.status_code == 200
    
    # 3. Step Simulation
    step_res = client.post("/api/simulation/step", json={"mission_id": mission_id})
    assert step_res.status_code == 200
    
    # 4. Simulate Low Battery What-If
    low_bat_res = client.post("/api/simulation/low-battery", json={
        "mission_id": mission_id,
        "uav_id": "UAV-01",
        "battery": 15.0
    })
    assert low_bat_res.status_code == 200
    
    # 5. Baseline Comparison
    comp_res = client.get(f"/api/missions/{mission_id}/compare")
    assert comp_res.status_code == 200
    assert "reactive" in comp_res.json()
    assert "predictive" in comp_res.json()
