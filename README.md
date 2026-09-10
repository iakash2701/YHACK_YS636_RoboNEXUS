# Self-Learning Risk-Aware Autonomous Mission Planner

A simulation-based multi-UAV autonomous mission planning and control center that demonstrates:

$$\text{Sense} \longrightarrow \text{Predict} \longrightarrow \text{Decide} \longrightarrow \text{Prevent} \longrightarrow \text{Replan} \longrightarrow \text{Learn}$$

---

## 1. Problem Statement
Traditional UAV mission planners operate **reactively** — detecting issues only *after* a drone has completely drained its battery, lost communication, or crashed mid-route. This post-failure recovery causes mission stalls, lost aircraft, and compromised mission objectives.

## 2. Proposed Solution
The **Self-Learning Risk-Aware Autonomous Mission Planner** continuously evaluates the telemetry, distance, health, communication quality, and atmospheric conditions of every active UAV using a trained Machine Learning Random Forest Risk Engine. When future mission-failure probability surges above safe thresholds, the system **proactively changes the mission plan before failure occurs**, calculating a new collision-free A* route and reassigning the task to a safer alternative UAV with zero mission downtime.

## 3. Core Novelty

```text
Traditional Reactive Planner:
  UAV Fails / Crashes ──> Detect Failure ──> Search Replacement ──> Reassign (Late & Aircraft Lost)

Proposed Predictive Planner:
  Monitor Telemetry ──> ML Risk Forecast ──> High Risk Detected ──> Proactive Reassign ──> New A* Route (Zero Crashes)
```

---

## 4. System Architecture

```text
                           React 18 + Vite + Tailwind CSS Frontend
                                          │
                                     REST / JSON
                                          │
                                          ▼
                               FastAPI Python Backend
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
            Mission Engine           Risk Engine             Route Engine
          (Task Allocator &      (Random Forest ML &         (A* Obstacle
             Replanner)             Explainable AI)           Avoidance)
                  │                       │                       │
                  └───────────────────────┼───────────────────────┘
                                          │
                                          ▼
                                  Simulation Engine
                              (Step / Telemetry Physics)
                                          │
                                          ▼
                                    SQLite Storage
```

---

## 5. Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React icons
- **Backend**: Python 3.11, FastAPI, Pydantic v2, Uvicorn
- **Machine Learning**: Scikit-learn (Random Forest Classifier on 8,000 synthetic simulation samples), NumPy, Pandas, Joblib
- **Path Planning**: 8-directional A* algorithm with Euclidean heuristic and obstacle clearance
- **Task Allocation**: Intelligent Weighted Assignment Scoring
- **Database**: SQLite (`mission_control.db`) with relational tables

---

## 6. Project Structure

```text
autonomous-mission-planner/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── missions.py       # Mission CRUD, planning, baseline comparison
│   │   │   ├── uavs.py           # UAV fleet management & telemetry
│   │   │   ├── tasks.py          # Task definitions & priorities
│   │   │   ├── simulation.py     # Live step ticking & What-If scenario triggers
│   │   │   ├── analytics.py      # Fleet metrics & event streams
│   │   │   └── ml.py             # ML metrics, inference & retraining
│   │   ├── ml/
│   │   │   ├── dataset.py        # 8,000-sample synthetic simulation dataset generator
│   │   │   ├── train.py          # Random Forest training & metric computation
│   │   │   └── predict.py        # ML inference & Explainable AI (XAI) contributions
│   │   ├── services/
│   │   │   ├── path_planner.py   # A* algorithm with 8-directional obstacle avoidance
│   │   │   ├── task_allocator.py # Multi-objective weighted assignment algorithm
│   │   │   ├── replanner.py      # Proactive failure risk detection & reassignment
│   │   │   ├── simulator.py      # Real-time state machine & telemetry physics
│   │   │   └── baseline_comparator.py # Empirical Reactive vs Predictive benchmark
│   │   ├── schemas/
│   │   │   └── mission_schema.py # Pydantic data validation schemas
│   │   ├── config.py             # Global constants & thresholds
│   │   ├── database.py           # SQLite schema & query helpers
│   │   └── main.py               # FastAPI application entrypoint & lifespan
│   ├── tests/
│   │   ├── test_path_planner.py
│   │   ├── test_task_allocator.py
│   │   ├── test_risk_engine.py
│   │   ├── test_replanner.py
│   │   └── test_api.py
│   ├── requirements.txt
│   └── conftest.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   ├── UAVCard.tsx
│   │   │   ├── UAVGrid.tsx
│   │   │   ├── MissionMap.tsx    # Interactive SVG airspace grid & live UAV animation
│   │   │   ├── TaskPanel.tsx
│   │   │   ├── RiskPanel.tsx     # Explainable AI feature contributions & recommendations
│   │   │   ├── AIDecisionPanel.tsx # Research contribution rationale
│   │   │   ├── WhatIfSimulator.tsx # Low battery, comms loss, failure, weather triggers
│   │   │   ├── SimulationControls.tsx
│   │   │   ├── MissionTimeline.tsx # Real-time event log
│   │   │   ├── ComparisonPanel.tsx # Reactive vs Predictive empirical comparison
│   │   │   ├── MLMetricsPanel.tsx  # Accuracy, Precision, Recall, F1, ROC-AUC
│   │   │   ├── AnalyticsCharts.tsx # Recharts battery & risk charts
│   │   │   ├── ReplanningNotificationModal.tsx # Proactive reassignment alert
│   │   │   └── MissionConfigModal.tsx
│   │   ├── hooks/
│   │   │   └── useSimulation.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── data/                         # SQLite database storage
├── models/                       # Trained risk_model.pkl & model_metrics.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 7. Installation & Setup (Windows PowerShell)

### Prerequisites
- Python 3.10+ (Installed on system or in user directory)
- Node.js 18+ and npm

### Backend Installation

```powershell
# In Windows PowerShell:
cd d:\Y_hack\backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Train the Machine Learning Model (if not already generated)
python -m app.ml.train

# Run automated tests
pytest tests -v
```

### Frontend Installation

```powershell
# In a new Windows PowerShell terminal:
cd d:\Y_hack\frontend

# Install node dependencies
npm install
```

---

## 8. Running the Application

### 1. Start Backend Server
```powershell
cd d:\Y_hack\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health: `http://127.0.0.1:8000/api/health`
- Swagger Documentation: `http://127.0.0.1:8000/docs`

### 2. Start Frontend UI
```powershell
cd d:\Y_hack\frontend
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 9. Step-by-Step Demo Flow

1. **Open Dashboard**: Navigate to `http://localhost:5173`. The system loads the default demo mission with 3 UAVs (`UAV-01`, `UAV-02`, `UAV-03`), 3 prioritized tasks, and obstacle zones.
2. **Plan Mission**: Click **“Plan Mission (A* + Risk)”**.
   - Intelligent Task Allocation assigns `TASK-01` to `UAV-01`.
   - Collision-free A* routes are computed around obstacles.
3. **Start Simulation**: Click **“Start Simulation”** (or press Step). UAVs begin animated movement along their routes, depleting battery based on distance and weather.
4. **Inject What-If Scenario**: Under the **What-If Scenario Injection Simulator**, click **“Low Bat”** on `UAV-01` (or drop battery to 20%).
5. **AI Risk Surge**: The ML Random Forest model instantly detects the battery deficit relative to destination distance, and `UAV-01` risk escalates to **HIGH (82%)**.
6. **Predictive Replanning Triggered**:
   - The system detects the risk surge *before* failure occurs.
   - It searches for a safer available drone (`UAV-02` with 90% battery).
   - A prominent **“PREDICTIVE REPLANNING TRIGGERED”** modal appears with causal root cause.
   - `TASK-01` is reassigned to `UAV-02`.
   - `UAV-01` safely turns back to base before crashing.
   - `UAV-02` calculates a new A* path to `TASK-01`.
7. **Mission Continues**: All tasks complete safely with **0 UAV crashes** and **100% mission completion**.
8. **View Evaluation Tab**: Click the **“Reactive vs Predictive Evaluation”** tab to see the side-by-side empirical benchmark proving failure prevention advantage.

---

## 10. Machine Learning & Algorithms

### ML Risk Prediction Model
- **Algorithm**: `RandomForestClassifier` (100 estimators, max depth 10, balanced samples).
- **Features**:
  1. `battery_percentage` (Current battery remaining %)
  2. `distance_to_task` (A* path distance to target)
  3. `distance_to_base` (Distance from target to recovery base)
  4. `uav_health` (Hardware / motor degradation index)
  5. `communication_quality` (Telemetry signal strength %)
  6. `speed` (Flight velocity)
  7. `task_priority` (Priority 1 to 5)
  8. `estimated_energy_required` (Distance × consumption × weather factor)
  9. `weather_factor` (Normal 1.0x, Windy 1.25x, Storm 1.60x)
- **Empirical Model Performance**:
  - Accuracy: **95.2%**
  - Precision: **96.5%**
  - Recall: **92.7%**
  - F1 Score: **94.6%**
  - ROC-AUC: **0.992**

### A* Path Planning
- Uses 8-directional neighbor exploration on a discrete grid.
- Euclidean distance heuristic: $h(n) = \sqrt{(x_n - x_{\text{goal}})^2 + (y_n - y_{\text{goal}})^2}$.
- Strict rectangular obstacle collision avoidance preventing corner-cutting.

### Task Allocation Score
$$\text{Assignment Score} = \text{Distance Cost} + (\text{Risk Probability})^{1.3} \times 1.8 + \left(\frac{\text{Energy Required}}{\text{Battery}}\right) \times 60.0 - (\text{Priority} \times 8.0)$$

---

## 11. Testing & Verification

Run the full pytest suite to verify all components:

```powershell
cd d:\Y_hack\backend
.\venv\Scripts\Activate.ps1
pytest tests -v
```

All 10 tests verify:
- A* direct and obstacle-avoidance routing
- Energy and time metrics calculations
- ML synthetic dataset generation and inference
- Low/high risk classification and XAI feature explanations
- Multi-criteria task allocation
- Predictive replanning triggers and state updates
- FastAPI health, metrics, and lifecycle integration
