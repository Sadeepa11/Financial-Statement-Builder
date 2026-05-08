@echo off
echo Starting Financial Statement Generator...

:: Kill any old instances
taskkill /F /IM node.exe >nul 2>&1

:: Start backend in its own persistent window
start "FSG Backend" /MIN cmd /c "cd /d C:\Users\mdmil\Downloads\FinancialStatementGenerator\backend-node && node server.js & pause"

:: Wait then start frontend
timeout /t 3 /nobreak >nul
start "FSG Frontend" /MIN cmd /c "cd /d C:\Users\mdmil\Downloads\FinancialStatementGenerator\frontend && npm run dev & pause"

:: Open browser after servers initialize
timeout /t 6 /nobreak >nul
start http://localhost:5173

echo Done! Browser opening to http://localhost:5173
echo.
echo Backend and Frontend are running in minimized windows.
echo Close this window — servers will keep running.
pause
