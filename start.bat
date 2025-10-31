@echo off
REM Myolika Reservations - Start Script for Windows
echo 🚀 Starting Myolika Reservations System...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Start services with Docker Compose
echo 📦 Starting services with Docker Compose...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if backend is ready
echo 🔍 Checking backend health...
set max_attempts=30
set attempt=1

:check_backend
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is ready!
    goto backend_ready
)

if %attempt% equ %max_attempts% (
    echo ❌ Backend failed to start after %max_attempts% attempts
    echo 📋 Checking logs...
    docker-compose logs backend
    pause
    exit /b 1
)

echo ⏳ Attempt %attempt%/%max_attempts% - Backend not ready yet...
timeout /t 2 /nobreak >nul
set /a attempt+=1
goto check_backend

:backend_ready
REM Initialize database
echo 🗄️ Initializing database...
docker-compose exec -T backend npm run prisma:migrate
docker-compose exec -T backend npm run prisma:seed

REM Check if frontend is ready
echo 🔍 Checking frontend...
set max_attempts=30
set attempt=1

:check_frontend
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is ready!
    goto frontend_ready
)

if %attempt% equ %max_attempts% (
    echo ❌ Frontend failed to start after %max_attempts% attempts
    echo 📋 Checking logs...
    docker-compose logs frontend
    pause
    exit /b 1
)

echo ⏳ Attempt %attempt%/%max_attempts% - Frontend not ready yet...
timeout /t 2 /nobreak >nul
set /a attempt+=1
goto check_frontend

:frontend_ready
echo.
echo 🎉 Myolika Reservations System is ready!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001/api
echo 🗄️ Database: localhost:5432
echo.
echo 🔐 Default credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo 📋 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
echo.
pause
