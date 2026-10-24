@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
node check-content.js
echo.
pause
