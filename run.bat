@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo           Starting Orvane Works (Local Dev)        
echo ===================================================

if not exist ".env.local" (
    if exist ".env.example" (
        echo [.env.local not found] Creating .env.local from .env.example...
        copy .env.example .env.local >nul
    )
)

echo Starting Next.js development server...
echo App URL: http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.

call npm.cmd run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo Development server exited with an error code: %ERRORLEVEL%
    pause
)
