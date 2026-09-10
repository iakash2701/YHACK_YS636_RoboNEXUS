# Backend — Self-Learning Risk-Aware Autonomous Mission Planner

FastAPI server providing ML risk prediction inference, A* collision-free routing, weighted multi-objective task allocation, real-time simulation ticking, and predictive replanning.

## Features
- **Machine Learning Risk Engine**: Scikit-learn `RandomForestClassifier` trained on 8,000 synthetic simulation samples with multi-dimensional risk prediction (0-100%) and normalized Explainable AI (XAI) feature contributions.
- **A* Path Planner**: 8-directional obstacle avoidance path planning with Euclidean heuristic and flight energy estimation.
- **Weighted Task Allocator**: Multi-objective candidate score `assignment_score = distance_cost + risk_cost + energy_cost - priority_bonus`.
- **Predictive Replanning**: Proactively reassigns tasks to safer candidate UAVs before low battery or fault leads to mission failure.
- **Reactive vs Predictive Baseline Comparator**: Empirically simulates both paradigms on identical missions to measure failure prevention rate and efficiency gains.
- **SQLite Storage**: Persists missions, UAVs, tasks, assignments, risk predictions, and event logs.

## Setup & Execution (Windows PowerShell)

```powershell
# 1. Activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train ML Risk Model
python -m app.ml.train

# 4. Run Pytest Test Suite
pytest tests -v

# 5. Start Backend Server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive Swagger API Documentation is accessible at `http://127.0.0.1:8000/docs`.
