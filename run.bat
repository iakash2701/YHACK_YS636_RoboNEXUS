@echo off
title Autonomous Mission Planner Launcher
echo ========================================================
echo Starting Autonomous Mission Planner Control Center...
echo ========================================================

set NODE_PATH=C:\Users\AKASH\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin
set PYTHON_PATH=C:\Users\AKASH\AppData\Local\Programs\Python\Python311
set PATH=%NODE_PATH%;%PYTHON_PATH%;%PYTHON_PATH%\Scripts;C:\Program Files\nodejs;%PATH%

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Backend - FastAPI Server" cmd /k "cd /d %~dp0backend && "%PYTHON_PATH%\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting React Vite Frontend on http://127.0.0.1:5173 ...
start "Frontend - Vite Dev Server" cmd /k "cd /d %~dp0frontend && "%NODE_PATH%\node.exe" "%~dp0frontend\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak >nul

echo Opening browser at http://127.0.0.1:5173 ...
start http://127.0.0.1:5173

echo ========================================================
echo System is ONLINE!
echo Frontend: http://127.0.0.1:5173
echo Backend:  http://127.0.0.1:8000/docs
echo ========================================================
