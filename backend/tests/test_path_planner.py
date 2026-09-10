import pytest
from app.services.path_planner import PathPlanner

def test_astar_direct_path():
    planner = PathPlanner(50, 50)
    start = (2.0, 2.0)
    goal = (10.0, 10.0)
    obstacles = []
    
    path = planner.find_path(start, goal, obstacles)
    assert len(path) >= 2
    assert path[0] == start
    assert path[-1] == goal

def test_astar_obstacle_avoidance():
    planner = PathPlanner(50, 50)
    start = (5.0, 10.0)
    goal = (25.0, 10.0)
    # Wall right in between
    obstacles = [{"id": "OBS-1", "x": 12, "y": 0, "width": 4, "height": 20}]
    
    path = planner.find_path(start, goal, obstacles)
    assert len(path) > 2
    
    # Verify no path point is inside the obstacle
    for pt in path:
        in_obs = (12 <= pt[0] < 16 and 0 <= pt[1] < 20)
        assert not in_obs, f"Path point {pt} collided with obstacle"

def test_path_metrics_calculation():
    planner = PathPlanner(50, 50)
    path = [(0.0, 0.0), (3.0, 4.0)] # Distance = 5.0
    metrics = planner.calculate_path_metrics(path, speed=1.0, weather="NORMAL")
    assert metrics["distance"] == 5.0
    assert metrics["travel_time"] == 5.0
    assert metrics["energy_required"] > 0
