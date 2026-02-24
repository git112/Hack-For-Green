@echo off
echo ============================================================
echo   CITY AIR WATCH — Full Stack Launcher
echo   Pathway Engine + Node.js Backend + React Frontend
echo ============================================================
echo.

REM Kill anything on ports 3000, 5000, 8080 to ensure clean start
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000 " ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5000 " ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8080 " ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
timeout /t 1 /nobreak >nul

echo [1/3] Starting Pathway Streaming Engine (port 5000)...
start "Pathway Engine" cmd /k "python pathway_service/pathway_engine.py"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Backend (port 3000)...
start "Node Backend" cmd /k "cd server && npm run dev"
timeout /t 4 /nobreak >nul

echo [3/3] Starting React Frontend (port 8080)...
start "React Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo   All services started!
echo.
echo   Frontend:        http://localhost:8080
echo   Backend API:     http://localhost:3000
echo   Pathway Engine:  http://localhost:5000
echo   Stream Monitor:  http://localhost:8080/admin/stream
echo.
echo   Admin Login:  username: admin  password: admin123
echo ============================================================
pause
