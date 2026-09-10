import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = str(DATA_DIR / "mission_control.db")
MODEL_FILE_PATH = str(MODELS_DIR / "risk_model.pkl")
METRICS_FILE_PATH = str(MODELS_DIR / "model_metrics.json")

# Simulation defaults
DEFAULT_MAP_WIDTH = 50
DEFAULT_MAP_HEIGHT = 50
DEFAULT_BATTERY_CRITICAL_THRESHOLD = 20.0
DEFAULT_RISK_HIGH_THRESHOLD = 70.0
DEFAULT_RISK_MEDIUM_THRESHOLD = 40.0

WEATHER_ENERGY_FACTORS = {
    "NORMAL": 1.0,
    "WINDY": 1.25,
    "STORM": 1.60
}

WEATHER_RISK_BIAS = {
    "NORMAL": 0.0,
    "WINDY": 0.10,
    "STORM": 0.25
}
