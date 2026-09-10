import json
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Set

from app.database import init_db, fetch_one
from app.ml.train import get_or_train_model
from app.api.missions import router as missions_router, create_mission, DEFAULT_DEMO_UAVS, DEFAULT_DEMO_TASKS, DEFAULT_DEMO_OBSTACLES
from app.api.uavs import router as uavs_router
from app.api.tasks import router as tasks_router
from app.api.simulation import router as simulation_router
from app.api.analytics import router as analytics_router
from app.api.ml import router as ml_router
from app.schemas.mission_schema import MissionCreate, UAVCreate, TaskCreate, Obstacle
from app.services.simulator import get_simulation_engine

# Active WebSocket connections per mission
mission_connections: Dict[str, Set[WebSocket]] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite Database Tables
    print("Initializing SQLite Database...")
    init_db()
    
    # 2. Check / Train ML Risk Model
    print("Checking / Training Machine Learning Risk Model...")
    get_or_train_model()
    
    # 3. Seed Default Demo Mission if empty
    existing_mission = fetch_one("SELECT * FROM missions LIMIT 1")
    if not existing_mission:
        print("Seeding default demo mission...")
        demo_mission_data = MissionCreate(
            name="Demo Operation: Sector Alpha Surveillance",
            weather="NORMAL",
            map_width=50,
            map_height=50,
            uavs=[UAVCreate(**u) for u in DEFAULT_DEMO_UAVS],
            tasks=[TaskCreate(**t) for t in DEFAULT_DEMO_TASKS],
            obstacles=[Obstacle(**o) for o in DEFAULT_DEMO_OBSTACLES]
        )
        create_mission(demo_mission_data)
        
    yield
    print("Shutting down Mission Planner Backend.")

app = FastAPI(
    title="Self-Learning Risk-Aware Autonomous Mission Planner",
    description="Multi-UAV Autonomous Mission Control Center with ML-Driven Predictive Risk Replanning and A* Path Planning.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(missions_router)
app.include_router(uavs_router)
app.include_router(tasks_router)
app.include_router(simulation_router)
app.include_router(analytics_router)
app.include_router(ml_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "Self-Learning Risk-Aware Autonomous Mission Planner",
        "version": "1.0.0",
        "ai_risk_engine": "ACTIVE (RandomForestClassifier)"
    }

@app.websocket("/ws/mission/{mission_id}")
async def websocket_mission_endpoint(websocket: WebSocket, mission_id: str):
    await websocket.accept()
    if mission_id not in mission_connections:
        mission_connections[mission_id] = set()
    mission_connections[mission_id].add(websocket)
    
    sim = get_simulation_engine()
    
    try:
        while True:
            # Send latest state every 500ms
            state = sim.get_mission_state(mission_id)
            await websocket.send_json(state)
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        mission_connections[mission_id].discard(websocket)
    except Exception:
        mission_connections[mission_id].discard(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
