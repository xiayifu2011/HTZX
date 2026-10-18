@echo off
chcp 65001 >nul
title 中考人生模拟器 · 局域网展示
echo.
echo   启动本地服务器，同一 WiFi 下的手机/电脑都能访问
echo.
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  echo   正在启动（Python）...
  for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo   本机地址: http://%%a:8000
  start "" http://localhost:8000
  python -m http.server 8000
) else (
  echo   未检测到 Python，将直接打开本地文件
  start "" "index.html"
)
pause
