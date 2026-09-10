# Frontend — Self-Learning Risk-Aware Autonomous Mission Planner

Aerospace-grade mission control center built with React 18, Vite, TypeScript, Tailwind CSS, Recharts, and Lucide React.

## Features
- **Tactical Airspace Map**: Interactive 50x50 coordinate grid SVG with live UAV positions, collision-free A* routes, obstacle zones, task waypoints, and animated indicators.
- **Top 6 Metric Cards**: Active UAVs, Mission Completion, Average Risk, Replanning Events, Energy Consumed, Mission Time.
- **Fleet Telemetry Grid**: Battery, Health, and Comms Link progress bars with quick What-If scenario triggers.
- **Explainable AI Panel**: Normalized stress factor bar charts and real-time AI assessments.
- **AI Decision Rationale Panel**: Sense → Predict → Decide → Prevent → Replan workflow tracking.
- **What-If Scenario Simulator**: Interactive triggers for Low Battery (20%), Comms Loss (12%), Hardware Failure, Storm Weather, and Dynamic Obstacles.
- **Comparative Evaluation Dashboard**: Quantitative comparison table between Reactive Baseline and Proposed Predictive Planner.
- **ML Diagnostics & Analytics**: Live Recharts metrics, ROC-AUC, accuracy, precision, recall, F1, and Gini feature importances.

## Setup & Execution (Windows PowerShell)

```powershell
npm install
npm run dev
```

App runs on `http://localhost:5173`.
