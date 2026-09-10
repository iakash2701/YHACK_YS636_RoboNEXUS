from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Coordinate(BaseModel):
    x: float
    y: float

class Obstacle(BaseModel):
    id: str
    x: float
    y: float
    width: float
    height: float

class TaskCreate(BaseModel):
    name: str
    x: float
    y: float
    priority: int = Field(default=3, ge=1, le=5)

class TaskResponse(BaseModel):
    id: str
    mission_id: str
    name: str
    x: float
    y: float
    priority: int
    status: str
    assigned_uav_id: Optional[str] = None
    completed_at: Optional[str] = None

class UAVCreate(BaseModel):
    id: str
    x: float
    y: float
    base_x: Optional[float] = None
    base_y: Optional[float] = None
    battery: float = Field(default=100.0, ge=0.0, le=100.0)
    health: float = Field(default=100.0, ge=0.0, le=100.0)
    communication: float = Field(default=100.0, ge=0.0, le=100.0)
    speed: float = Field(default=1.0, gt=0.0)

class UAVResponse(BaseModel):
    id: str
    mission_id: Optional[str] = None
    x: float
    y: float
    base_x: float
    base_y: float
    battery: float
    health: float
    communication: float
    speed: float
    status: str
    current_task_id: Optional[str] = None
    target_x: Optional[float] = None
    target_y: Optional[float] = None
    route: List[List[float]] = []
    route_index: int = 0
    total_energy_consumed: float = 0.0
    risk_level: Optional[str] = "LOW"
    risk_probability: Optional[float] = 0.0

class MissionCreate(BaseModel):
    name: str = "Autonomous Multi-UAV Operation"
    weather: str = "NORMAL"
    map_width: int = 50
    map_height: int = 50
    num_uavs: Optional[int] = None
    uavs: Optional[List[UAVCreate]] = None
    tasks: Optional[List[TaskCreate]] = None
    obstacles: Optional[List[Obstacle]] = None
    battery_threshold: float = 20.0
    risk_threshold: float = 70.0

class MissionResponse(BaseModel):
    id: str
    name: str
    status: str
    weather: str
    map_width: int
    map_height: int
    obstacles: List[Obstacle]
    uavs: List[UAVResponse]
    tasks: List[TaskResponse]
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class RiskPredictionResponse(BaseModel):
    uav_id: str
    task_id: Optional[str]
    risk_probability: float
    risk_level: str
    feature_contributions: Dict[str, float]
    recommendation: Optional[str] = None

class MissionEventResponse(BaseModel):
    id: int
    mission_id: str
    event_type: str
    title: str
    description: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str

class SimulationStepResponse(BaseModel):
    mission_id: str
    step: int
    uavs: List[UAVResponse]
    tasks: List[TaskResponse]
    events: List[MissionEventResponse]
    replanning_triggered: bool = False
    status: str
