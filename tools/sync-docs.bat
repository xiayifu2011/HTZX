@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   Syncing docs/*.md  ->  ../js/00-docs.js
echo.
node sync-docs.js
echo.
pause
