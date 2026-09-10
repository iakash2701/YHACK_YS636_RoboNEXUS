@echo off
cls
echo =======================================================================
echo    Pushing RoboNEXUS Mission Planner to GitHub Repository
echo =======================================================================
echo.
echo Target: https://github.com/iakash2701/YHACK_YS636_RoboNEXUS.git
echo.
set PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%
git push -u origin main
echo.
echo =======================================================================
if %ERRORLEVEL% EQU 0 (
    echo    SUCCESS: Repository updated on GitHub!
) else (
    echo    If authentication failed, enter your GitHub Personal Access Token (PAT).
)
echo =======================================================================
pause
