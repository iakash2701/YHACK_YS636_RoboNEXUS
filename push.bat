@echo off
cls
echo =======================================================================
echo          ROBONEXUS AUTONOMOUS MISSION PLANNER - GITHUB PUSH
echo =======================================================================
echo.
echo Target Repository: https://github.com/iakash2701/YHACK_YS636_RoboNEXUS
echo Branch: main
echo.
echo Option 1: If you have a GitHub Personal Access Token (PAT):
echo           Paste it below and press Enter.
echo.
echo Option 2: If you don't have a token, just press Enter to use Git login.
echo.
set /p GITHUB_TOKEN="Enter GitHub Token (or press Enter): "

set PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%

if "%GITHUB_TOKEN%"=="" (
    echo.
    echo Pushing via standard git...
    git push -u origin main --force
) else (
    echo.
    echo Pushing with authentication token...
    git push https://iakash2701:%GITHUB_TOKEN%@github.com/iakash2701/YHACK_YS636_RoboNEXUS.git main --force
)

echo.
echo =======================================================================
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Code successfully pushed to GitHub! Refresh your browser.
) else (
    echo [FAILED] Push failed. Please check your token or repository permissions.
)
echo =======================================================================
pause
