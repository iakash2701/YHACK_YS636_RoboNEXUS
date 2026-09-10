import pytest
from app.services.path_planner import PathPlanner
from app.services.replanner import PredictiveReplanner

def test_predictive_replanning_trigger():
    planner = PathPlanner(50, 50)
    replanner = PredictiveReplanner(planner)
    
    # UAV-01 is executing TASK-01 with dangerously depleted battery and far away
    uavs = [
        {
            "id": "UAV-01",
            "x": 10.0, "y": 10.0, "base_x": 0.0, "base_y": 0.0,
            "battery": 15.0, # Critically low
            "health": 60.0, "communication": 70.0, "speed": 1.0,
            "status": "EN_ROUTE", "current_task_id": "TASK-01"
        },
        {
            "id": "UAV-02",
            "x": 25.0, "y": 25.0, "base_x": 25.0, "base_y": 25.0,
            "battery": 95.0, # Healthy replacement close to task
            "health": 95.0, "communication": 95.0, "speed": 1.0,
            "status": "IDLE", "current_task_id": None
        }
    ]
    
    tasks = [
        {"id": "TASK-01", "name": "Target Alpha", "x": 30.0, "y": 30.0, "priority": 5, "status": "ASSIGNED", "assigned_uav_id": "UAV-01"}
    ]
    
    res = replanner.evaluate_and_replan(uavs, tasks, obstacles=[], weather="NORMAL", risk_threshold=65.0)
    assert res["replanning_occurred"] is True
    assert len(res["events"]) == 1
    
    event = res["events"][0]
    assert event["old_uav_id"] == "UAV-01"
    assert event["new_uav_id"] == "UAV-02"
    assert event["task_id"] == "TASK-01"
    
    # Verify UAV states transitioned
    assert uavs[0]["status"] == "RETURNING"
    assert uavs[1]["status"] == "EN_ROUTE"
    assert tasks[0]["assigned_uav_id"] == "UAV-02"
