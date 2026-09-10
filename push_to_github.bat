@echo off
echo =======================================================
echo    Pushing RoboNEXUS Mission Planner to GitHub
echo =======================================================
set PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%
git push -u origin main
pause
