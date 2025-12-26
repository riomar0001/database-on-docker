@echo off
REM Usage: run-compose.bat <service-folder>
cd /d "%~dp0"
if "%1"=="" (
  echo Usage: %0 ^<service-folder^>
  exit /b 1
)
if not exist "..\%1" (
  echo Error: Service folder "%1" not found
  exit /b 1
)
cd ..\%1
docker compose up