@echo off
chcp 65001 >nul
title Zhongkao Life Simulator
echo.
echo   Starting  Zhongkao Life Simulator ...
echo   A browser window will open. Close it to quit.
echo.
start "" "%~dp0index.html"
timeout /t 2 >nul
echo   Done. If nothing opened, double-click index.html yourself.
echo.
pause
