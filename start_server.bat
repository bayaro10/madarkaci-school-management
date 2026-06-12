@echo off
:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Navigate to the project directory
cd /d "c:\Users\ABU MUBAJJAL\Documents\Codex\2026-06-04\pleace-generate-school-database-managment-for\outputs"
:: Start the Node.js server
node server.js