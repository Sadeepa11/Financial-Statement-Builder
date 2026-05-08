@echo off
echo.
echo  ============================================
echo   Financial Statement Generator - Node Backend
echo  ============================================
echo.
cd /d "%~dp0backend-node"
echo  Starting Node.js backend on port 8000...
echo  Press Ctrl+C to stop.
echo.
node server.js
pause
