@echo off
chcp 65001 >nul
title 中考人生模拟器
echo.
echo   正在启动 中考人生模拟器 ...
echo   浏览器打开后请勿关闭本窗口
echo.
start "" "%~dp0index.html"
timeout /t 2 >nul
echo   已打开。如果没自动弹出，请手动双击 index.html
echo.
pause
