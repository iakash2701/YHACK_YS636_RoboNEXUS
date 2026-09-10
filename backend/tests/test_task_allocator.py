import pytest
from app.services.path_planner import PathPlanner
from app.services.task_allocator import TaskAllocator

def test_task_allocation():
    planner = PathPlanner(50, 50)
    allocator = TaskAllocator(planner)
    
    uavs = [
        {"id": "UAV-01", "x": 2.0, "y": 2.0, "base_x": 2.0, "base_y": 2.0, "battery": 90.0, "health": 95.0, "communication": 95.0, "speed": 1.0, "status": "IDLE"},
        {"id": "UAV-02", "x": 40.0, "y": 40.0, "base_x": 40.0, "base_y": 40.0, "battery": 90.0, "health": 95.0, "communication": 95.0, "speed": 1.0, "status": "IDLE"}
    ]
    
    tasks = [
        {"id": "TASK-01", "name": "Task near UAV-01", "x": 4.0, "y": 4.0, "priority": 4, "status": "PENDING"},
        {"id": "TASK-02", "name": "Task near UAV-02", "x": 38.0, "y": 38.0, "priority": 3, "status": "PENDING"}
    ]
    
    assignments = allocator.allocate_tasks(uavs, tasks, obstacles=[], weather="NORMAL")
    assert len(assignments) == 2
    
    assign_map = {a["task_id"]: a["uav_id"] for a in assignments}
    assert assign_map["TASK-01"] == "UAV-01"
    assert assign_map["TASK-02"] == "UAV-02"
