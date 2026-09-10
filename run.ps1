Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

$env:PATH = "C:\Program Files\nodejs;" + "$env:LOCALAPPDATA\Programs\Python311;" + "$env:LOCALAPPDATA\Programs\Python311\Scripts;" + $env:PATH

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Autonomous Mission Planner Control Center..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Start Backend in new window
Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Program Files\nodejs;' + '`$env:LOCALAPPDATA\Programs\Python311;' + '`$env:LOCALAPPDATA\Programs\Python311\Scripts;' + `$env:PATH; cd '$PSScriptRoot\backend'; & '`$env:LOCALAPPDATA\Programs\Python311\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 2

# 2. Start Frontend in new window
Write-Host "[2/2] Launching React Vite Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; `$env:PATH = 'C:\Program Files\nodejs;' + '`$env:LOCALAPPDATA\Programs\Python311;' + '`$env:LOCALAPPDATA\Programs\Python311\Scripts;' + `$env:PATH; cd '$PSScriptRoot\frontend'; npm.cmd run dev -- --host 127.0.0.1 --port 5173"

Start-Sleep -Seconds 3

# 3. Open browser
Start-Process "http://127.0.0.1:5173"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "System is ONLINE!" -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host "Backend:  http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
