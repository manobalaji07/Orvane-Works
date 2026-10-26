@echo off
setlocal
echo ========================================================
echo   Orvane Works - Set Administrator Password
echo   Email: orvaneworks@gmail.com
echo ========================================================
echo.
set /p ADMIN_PASSWORD="Enter your desired password (min 8 chars): "
if "%ADMIN_PASSWORD%"=="" (
    echo Error: Password cannot be empty.
    pause
    exit /b 1
)

npx.cmd vite-node scripts/set-admin-password.ts

echo.
pause
