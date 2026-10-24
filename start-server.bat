@echo off
chcp 65001 >nul
title Zhongkao Life Simulator - LAN Showcase
echo.
echo   Starting a local server so phones/PCs on the same WiFi can play.
echo.
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  echo   Python found, starting server on port 8000 ...
  for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo   Address: http://%%a:8000
  start "" http://localhost:8000
  python -m http.server 8000
) else (
  echo   Python not found. Opening the local file instead.
  start "" "index.html"
)
pause
