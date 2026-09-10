# Build a Complete Self-Learning Risk-Aware Autonomous Mission Planner

You are an expert full-stack AI/ML engineer, robotics engineer, UI/UX designer, and software architect.

Build a **complete, runnable, polished web application** called:

**“Self-Learning Risk-Aware Autonomous Mission Planner”**

The application is a simulation-based multi-UAV autonomous mission planning system.

The core innovation is:

> **Existing mission planners generally react after a problem occurs. Our system predicts future mission-failure risk and proactively changes the mission plan before failure occurs.**

The system must demonstrate:

**Sense → Predict → Decide → Prevent → Replan → Learn**

---

# 1. PROJECT GOAL

Create a web application that simulates multiple UAVs (Unmanned Aerial Vehicles) performing different mission tasks.

The system should:

1. Accept mission tasks.
2. Manage multiple UAVs.
3. Monitor UAV battery, health, communication quality and position.
4. Predict the probability of mission failure using machine learning.
5. Assign tasks intelligently to UAVs.
6. Calculate collision-free routes using A*.
7. Continuously monitor UAV conditions.
8. Detect increasing future risk.
9. Proactively reassign tasks before UAV failure.
10. Recalculate routes after reassignment.
11. Simulate UAV failures and environmental changes.
12. Store mission events.
13. Display all decisions on a professional dashboard.
14. Explain why a task was reassigned.
15. Compare the proposed predictive planner with a normal reactive planner.
16. Display useful mission performance metrics.

This is a **simulation/digital-twin project**, not a real drone-control system.

Do NOT require real drones, GPS hardware, LiDAR, ROS2, or physical hardware.

---

# 2. IMPORTANT IMPLEMENTATION RULE

Do not give me a partial prototype.

Generate the complete application with:

* Frontend
* Backend
* Machine learning
* Database/storage
* Simulation engine
* Path planning
* Task allocation
* Predictive replanning
* Visualization
* Documentation

Everything must work together.

Do not leave TODO placeholders.

Do not write:

“implement this later”

“add your code here”

or incomplete functions.

If a complex feature is unnecessary for the MVP, implement a simpler working version instead.

---

# 3. TECHNOLOGY STACK

Use this stack unless there is a strong technical reason to change it.

## Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* Recharts
* Lucide React icons

## Backend

* Python
* FastAPI
* Pydantic

## Machine Learning

* Python
* scikit-learn
* Random Forest or Gradient Boosting

## Path Planning

* A* algorithm

## Task Allocation

Implement a weighted intelligent assignment algorithm.

Prefer:

* Hungarian Algorithm

or, if a dependency creates unnecessary complexity:

* custom weighted assignment algorithm

## Storage

Use SQLite.

Store:

* missions
* UAV states
* tasks
* risk predictions
* assignments
* replanning events
* mission results

## Communication

Frontend communicates with backend using REST APIs.

Use polling or WebSocket for live simulation updates.

Prefer WebSocket if implementation remains stable.

---

# 4. APPLICATION ARCHITECTURE

Use this architecture:

```text
                 React Frontend
                       |
                       |
                  REST/WebSocket
                       |
                       v
                 FastAPI Backend
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
   Mission Engine   Risk Engine   Route Engine
        |              |              |
        |              v              |
        |        Machine Learning     |
        |                             |
        +--------------+--------------+
                       |
                       v
                Simulation Engine
                       |
                       v
                    SQLite
```

---

# 5. MAIN USER INTERFACE

Create a professional dashboard.

The UI should look like a modern aerospace/defense/robotics control center.

Do NOT make it look like a basic student HTML page.

Use:

* dark professional theme
* glass/modern cards
* clean typography
* responsive layout
* status badges
* charts
* map/grid visualization
* smooth animations
* clear hierarchy

Use a dark navy/charcoal interface with subtle accent colors.

Do not overuse gradients.

---

# 6. DASHBOARD LAYOUT

Create a main dashboard with:

## Header

Display:

**Autonomous Mission Planner**

Subtitle:

**Self-Learning Risk-Aware Multi-UAV Mission Control**

Show:

* System status: ONLINE
* Simulation status
* Current mission
* Number of UAVs
* Current time

---

# 7. TOP METRIC CARDS

Display:

### Active UAVs

Example:

`3 / 3`

### Mission Completion

Example:

`67%`

### Average Risk

Example:

`34%`

### Replanning Events

Example:

`2`

### Energy Consumed

Example:

`41%`

### Mission Time

Example:

`04:32`

---

# 8. UAV MONITORING PANEL

Create cards for each UAV.

Example:

```text
UAV-01

Battery       42%
Health        91%
Communication 87%

Position
X: 12
Y: 18

Current Task
Inspect Area A

Risk
HIGH
82%
```

Use progress bars.

Battery:

* high = healthy
* medium = warning
* low = critical

Risk:

* LOW
* MEDIUM
* HIGH

---

# 9. MISSION MAP

Create a large interactive simulation map.

It should show:

* UAVs
* Tasks
* Obstacles
* Routes
* Start/base position
* Destination
* Current UAV position
* Completed tasks
* Pending tasks

Use a grid-based map.

The map can be implemented using:

* SVG
* HTML Canvas
* React SVG

Do NOT require an external map API.

The simulation map should work offline.

---

# 10. UAV VISUALIZATION

Represent UAVs using icons.

Each UAV should display:

* UAV ID
* position
* current task
* risk level

Example:

```text
       🚁
     UAV-01
      HIGH
```

Animate UAV movement along the route.

The UAV should move step-by-step through the calculated path.

---

# 11. TASK VISUALIZATION

Represent tasks as map points.

Example:

```text
● TASK-01
  Inspect Area A
```

Use different visual states:

* pending
* assigned
* executing
* completed
* failed

---

# 12. OBSTACLES

Create obstacles on the map.

Example:

```text
██████
██████
██████
```

The A* algorithm must avoid these obstacles.

Allow some predefined obstacles.

Also provide the option to add obstacles manually if practical.

---

# 13. MISSION CREATION

Create a Mission Control section.

Allow the user to configure:

### Number of UAVs

1–10

### Mission tasks

Allow adding:

* task name
* X coordinate
* Y coordinate
* priority

### Mission parameters

* map size
* number of obstacles
* battery threshold
* risk threshold

Button:

**Create Mission**

---

# 14. MACHINE LEARNING RISK ENGINE

Implement an actual ML model.

Use:

**Random Forest Classifier**

The model predicts:

**Probability that a UAV will fail to safely complete its assigned task.**

Input features:

```text
battery_percentage
distance_to_task
distance_to_base
uav_health
communication_quality
speed
task_priority
estimated_energy_required
```

Output:

```text
risk_probability
risk_level
```

Risk levels:

```text
0–39%   LOW
40–69%   MEDIUM
70–100% HIGH
```

---

# 15. TRAINING DATA

Do NOT hard-code only 10–15 examples.

Generate a realistic synthetic simulation dataset.

Create at least:

**5,000–10,000 samples**

Features:

* battery
* distance
* health
* communication
* speed
* task priority
* energy requirement
* weather factor

Generate labels based on realistic mission completion conditions.

Train the model when the backend starts if no trained model exists.

Save the trained model to disk.

Example:

```text
models/risk_model.pkl
```

Also save model metrics.

---

# 16. ML MODEL METRICS

Calculate and display:

* Accuracy
* Precision
* Recall
* F1 Score
* ROC-AUC

Create a backend API:

```text
GET /api/ml/metrics
```

Display these metrics in the dashboard.

---

# 17. RISK PREDICTION

For every assigned UAV:

Calculate:

```text
Distance to task
+
Expected energy
+
Battery availability
+
Health
+
Communication
+
Environmental factor
```

Send these features to the ML model.

Return:

```json
{
  "uav_id": "UAV-01",
  "task_id": "TASK-01",
  "risk_probability": 82.5,
  "risk_level": "HIGH"
}
```

---

# 18. EXPLAINABLE AI

The dashboard must explain why a UAV is high risk.

Example:

```text
UAV-01 Risk: 82%

Main risk factors:

Battery level       ███████████ 35%
Distance             ████████    25%
Communication       █████        15%
Health               ███          8%
Energy requirement   ███          7%
```

If SHAP can be implemented reliably, use SHAP.

If SHAP creates dependency problems, implement a lightweight feature-contribution explanation based on normalized feature impact.

Do not fake exact SHAP values.

Label the explanation honestly.

---

# 19. TASK ALLOCATION

Implement intelligent task allocation.

Each task should be assigned based on:

```text
distance
battery
predicted risk
health
communication
task priority
estimated energy
```

Create a score:

```text
assignment_score =
    distance_cost
    + risk_cost
    + energy_cost
    - priority_bonus
```

Lower score = better assignment.

Use this to assign tasks to UAVs.

---

# 20. A* ROUTE PLANNER

Implement A* path planning.

Inputs:

```text
UAV starting position
Task destination
Obstacle grid
```

Output:

```text
[(x1,y1), (x2,y2), ...]
```

The route must avoid obstacles.

Calculate:

* route length
* estimated travel time
* estimated energy consumption

Display the route on the dashboard.

---

# 21. CORE NOVELTY — PREDICTIVE REPLANNING

This is the most important feature.

Do NOT simply wait until a UAV fails.

Continuously evaluate risk.

Workflow:

```text
Monitor UAV
      ↓
Predict future failure risk
      ↓
Risk HIGH?
      ↓
YES
      ↓
Find alternative UAV
      ↓
Predict alternative UAV risk
      ↓
Safer alternative available?
      ↓
YES
      ↓
Reassign task
      ↓
Calculate new route
      ↓
Continue mission
```

Display an event:

```text
⚠ Predictive Replanning

UAV-01 predicted failure risk: 82%

Reason:
Low battery + long travel distance

TASK-01 reassigned

Old UAV:
UAV-01

New UAV:
UAV-02

New predicted risk:
18%

Mission continues.
```

---

# 22. REACTIVE BASELINE

Implement a second planner for comparison.

### Reactive Planner

Only reacts AFTER UAV failure.

Workflow:

```text
UAV fails
 ↓
Detect failure
 ↓
Find replacement
 ↓
Reassign task
```

### Proposed Planner

```text
Predict risk
 ↓
Prevent failure
 ↓
Reassign before failure
```

This comparison is important for demonstrating novelty.

---

# 23. WHAT-IF SIMULATION

Add a section:

**What-If Simulator**

Buttons:

### Simulate Low Battery

Reduce selected UAV battery.

### Simulate Communication Loss

Reduce communication quality.

### Simulate UAV Failure

Set UAV state to failed.

### Simulate Obstacle

Add an obstacle to the current route.

### Simulate Weather Change

Increase energy consumption.

After each event:

Run the risk prediction again.

If necessary:

Trigger predictive replanning.

---

# 24. SIMULATION CONTROLS

Add:

```text
▶ Start Simulation

⏸ Pause

⟳ Reset

⚡ Simulation Speed

1x
2x
5x
10x
```

During simulation:

* UAVs move
* battery decreases
* communication changes
* risk changes
* tasks progress
* replanning occurs

---

# 25. MISSION TIMELINE

Create an event timeline.

Example:

```text
14:32:01
Mission started

14:32:12
TASK-01 assigned to UAV-01

14:32:28
UAV-01 risk increased to 72%

14:32:29
Predictive replanning triggered

14:32:30
TASK-01 reassigned to UAV-02

14:32:44
UAV-02 reached TASK-01

14:32:45
TASK-01 completed
```

---

# 26. ANALYTICS PAGE

Create an analytics section.

Display charts for:

### Risk over time

Line chart.

### Battery over time

Line chart.

### Mission completion

Progress/chart.

### Energy consumption

Bar chart.

### Replanning events

Bar chart.

### UAV performance

Comparison chart.

---

# 27. PERFORMANCE COMPARISON

Create a comparison between:

**Reactive Planner**

and

**Predictive Planner**

Metrics:

* Mission completion rate
* Mission duration
* Energy consumption
* Number of failures
* Number of replanning events
* Tasks completed
* Failure prevention rate

Example:

```text
                 Reactive    Predictive

Completion       82%         96%

Failures         3           1

Energy           100%        91%

Mission Time     08:32       07:45

Prevention       0%          67%
```

Do NOT hard-code fake results.

Generate these metrics from actual simulation runs.

---

# 28. MULTI-UAV SUPPORT

Support at least:

```text
UAV-01
UAV-02
UAV-03
UAV-04
UAV-05
```

Each UAV must have:

```text
id
position
battery
health
communication
speed
status
current_task
```

Statuses:

* IDLE
* ASSIGNED
* EN_ROUTE
* EXECUTING
* RETURNING
* COMPLETED
* FAILED
* LOW_BATTERY

---

# 29. UAV FAILURE LOGIC

A UAV should be considered unavailable when:

```text
battery < critical threshold
OR
health < critical threshold
OR
communication < critical threshold
OR
manually failed
```

However, the predictive system should ideally detect high risk BEFORE these thresholds are reached.

---

# 30. ENERGY MODEL

Implement a simple simulation energy model.

Example:

```text
energy_required =
    distance
    × base_consumption
    × weather_factor
    × payload_factor
```

Do not claim this is a real aircraft physics model.

Clearly label it as:

**Simulation Energy Model**

---

# 31. WEATHER SIMULATION

Create environmental conditions:

```text
NORMAL
WINDY
STORM
```

Weather should affect:

* energy consumption
* risk
* estimated mission time

Example:

```text
NORMAL → 1.0x energy

WINDY → 1.25x energy

STORM → 1.60x energy
```

---

# 32. DATABASE

Use SQLite.

Create tables:

```text
uavs
tasks
missions
assignments
risk_predictions
mission_events
mission_results
```

Create proper relationships.

Use SQLAlchemy if useful.

---

# 33. API ENDPOINTS

Implement at least:

```text
GET  /api/health

GET  /api/uavs

POST /api/uavs

GET  /api/tasks

POST /api/tasks

DELETE /api/tasks/{id}

POST /api/missions

GET  /api/missions

POST /api/missions/{id}/plan

POST /api/missions/{id}/start

POST /api/missions/{id}/pause

POST /api/missions/{id}/reset

GET  /api/missions/{id}/status

GET  /api/missions/{id}/risks

POST /api/missions/{id}/replan

POST /api/simulation/step

POST /api/simulation/failure

POST /api/simulation/low-battery

POST /api/simulation/communication-loss

POST /api/simulation/weather

GET  /api/events

GET  /api/analytics

GET  /api/ml/metrics
```

---

# 34. API DOCUMENTATION

FastAPI Swagger documentation should work.

Make sure:

```text
/docs
```

works.

---

# 35. FRONTEND COMPONENTS

Create reusable React components:

```text
Dashboard
Header
MetricCard
UAVCard
UAVGrid
MissionMap
TaskPanel
RiskPanel
RiskBadge
MissionTimeline
SimulationControls
Analytics
ComparisonPanel
MLMetrics
WhatIfSimulator
```

---

# 36. STATE MANAGEMENT

Use React state/hooks.

Keep frontend state synchronized with backend.

Important state:

```text
uavs
tasks
mission
risks
routes
events
analytics
simulationStatus
```

---

# 37. REAL-TIME UPDATES

Prefer WebSocket:

```text
/ws/mission/{mission_id}
```

Send updates when:

* UAV moves
* battery changes
* risk changes
* task changes
* replanning occurs
* task completes

If WebSocket causes instability, use polling every 1–2 seconds.

The application must remain stable.

---

# 38. ERROR HANDLING

Implement proper error handling.

Frontend should display useful messages.

Backend should return proper HTTP status codes.

Do not allow invalid:

* coordinates
* battery values
* task priority
* UAV IDs

---

# 39. RESET FUNCTION

The user must be able to reset the simulation.

Reset:

* UAV positions
* batteries
* health
* communication
* tasks
* routes
* events
* metrics

---

# 40. DEMO SCENARIO

Provide a default demo mission.

Use:

### UAVs

```text
UAV-01
Position: (2,2)
Battery: 45%

UAV-02
Position: (10,5)
Battery: 90%

UAV-03
Position: (5,10)
Battery: 70%
```

### Tasks

```text
TASK-01
Inspect Area A
Position: (30,20)
Priority: 5

TASK-02
Inspect Area B
Position: (15,35)
Priority: 4

TASK-03
Monitor Area C
Position: (40,40)
Priority: 3
```

### Obstacles

Add several rectangular obstacle zones.

---

# 41. DEMO FLOW

The application should make this demo easy:

### Step 1

Create demo mission.

### Step 2

Click:

**Plan Mission**

System performs:

```text
Task Allocation
+
Risk Prediction
+
A* Routing
```

### Step 3

Click:

**Start Simulation**

UAVs begin moving.

### Step 4

Simulate low battery for UAV-01.

### Step 5

Risk increases.

### Step 6

The AI predicts high mission-failure risk.

### Step 7

System automatically triggers:

**Predictive Replanning**

### Step 8

Task is reassigned to safer UAV.

### Step 9

New A* route is calculated.

### Step 10

Mission continues.

This entire sequence should be visible on the dashboard.

---

# 42. IMPORTANT UX FEATURE

When replanning happens, display a prominent notification:

```text
PREDICTIVE REPLANNING

UAV-01
Risk: 82%

Task:
TASK-01

Reason:
Predicted mission failure due to
low battery and long distance.

Action:
TASK-01 → UAV-02

New Risk:
18%

Mission Status:
CONTINUING
```

---

# 43. RESEARCH CONTRIBUTION DISPLAY

Create an “AI Decision” panel.

Show:

```text
Why did the planner replan?

✓ High predicted failure probability
✓ Insufficient expected battery margin
✓ Long travel distance
✓ Alternative UAV available
✓ Alternative UAV has lower predicted risk
```

---

# 44. SECURITY / SAFETY

This is a simulation only.

Do NOT implement:

* weapon targeting
* attack planning
* surveillance of real people
* real-world autonomous weapon control

The application should remain a safe academic simulation.

---

# 45. FILE STRUCTURE

Create a clean structure similar to:

```text
autonomous-mission-planner/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   │
│   │   ├── api/
│   │   │   ├── missions.py
│   │   │   ├── uavs.py
│   │   │   ├── simulation.py
│   │   │   └── analytics.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── risk_engine.py
│   │   │   ├── mission_planner.py
│   │   │   ├── task_allocator.py
│   │   │   ├── path_planner.py
│   │   │   ├── simulator.py
│   │   │   └── replanner.py
│   │   │
│   │   └── ml/
│   │       ├── train.py
│   │       ├── predict.py
│   │       └── dataset.py
│   │
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── README.md
│
├── data/
│
├── models/
│
├── README.md
└── .gitignore
```

You may simplify the structure if needed, but keep the code modular.

---

# 46. README

Generate a complete README containing:

## Project title

Self-Learning Risk-Aware Autonomous Mission Planner

## Problem

Traditional mission planners often react after failures or disruptions occur.

## Proposed solution

Predict mission-failure risk before failure and proactively adapt task assignments and routes.

## Novelty

```text
Predict → Prevent → Replan
```

## Features

List all implemented features.

## Architecture

Include an ASCII architecture diagram.

## Technology stack

List all technologies.

## Installation

Give exact Windows commands.

## Running backend

Give exact command.

## Running frontend

Give exact command.

## API documentation

Explain `/docs`.

## Demo

Explain the demo scenario.

## ML

Explain model and features.

## Algorithms

Explain:

* Random Forest
* A*
* Task allocation
* Predictive replanning

## Evaluation

Explain all metrics.

---

# 47. WINDOWS COMPATIBILITY

The project must run on Windows using VS Code.

Give exact commands for:

```powershell
python -m venv venv

.\venv\Scripts\Activate.ps1

pip install -r requirements.txt

npm install

npm run dev
```

Avoid Linux-only commands.

---

# 48. ENVIRONMENT CONFIGURATION

Use environment variables where appropriate.

Provide:

```text
.env.example
```

Do not require paid APIs.

The application should work locally without API keys.

---

# 49. NO EXTERNAL DEPENDENCY ON MAP APIS

Do not require:

* Google Maps API
* Mapbox token
* paid APIs

The mission map should work locally.

---

# 50. CODE QUALITY

Write clean, maintainable code.

Requirements:

* Type hints in Python
* Pydantic schemas
* Modular services
* Reusable React components
* Meaningful variable names
* Comments for important algorithms
* No duplicated logic
* Proper exception handling

---

# 51. IMPORTANT: DO NOT FAKE AI

The ML system must actually run a trained model.

Do not simply write:

```python
risk = 80
```

The risk must come from the ML model.

Synthetic training data is acceptable for this academic simulation.

Clearly state:

**Synthetic simulation dataset**

when appropriate.

---

# 52. IMPORTANT: DO NOT FAKE RESULTS

Do not hard-code:

```text
96% accuracy
67% prevention
```

Generate these values from actual simulations/model evaluation.

---

# 53. TESTING

Create basic backend tests for:

* risk prediction
* A* path planning
* task allocation
* predictive replanning
* simulation
* API health

The project should start without errors.

---

# 54. FINAL ACCEPTANCE CRITERIA

Consider the project complete only when:

1. Backend starts successfully.
2. Frontend starts successfully.
3. Dashboard loads.
4. UAVs appear.
5. Tasks appear.
6. Mission can be planned.
7. AI predicts risk.
8. Routes are generated.
9. Obstacles are avoided.
10. Simulation moves UAVs.
11. Battery decreases.
12. Risk changes dynamically.
13. High-risk UAV triggers predictive replanning.
14. Task gets reassigned.
15. New route is generated.
16. Mission continues.
17. Events appear in timeline.
18. Analytics update.
19. Reactive vs predictive comparison works.
20. Reset works.
21. API documentation works.
22. README contains setup instructions.

---

# 55. FINAL RESPONSE FORMAT

After generating the application, do NOT just explain the architecture.

Give me:

1. Complete project structure.
2. All files created.
3. Installation commands.
4. Backend run command.
5. Frontend run command.
6. Demo instructions.
7. Test instructions.
8. Explanation of where the AI risk prediction is implemented.
9. Explanation of where predictive replanning is implemented.
10. Explanation of how the novelty differs from a normal reactive planner.

If you encounter a dependency or implementation issue, fix the code rather than stopping.

Build the application as a **complete working academic project**, not a toy code snippet.
