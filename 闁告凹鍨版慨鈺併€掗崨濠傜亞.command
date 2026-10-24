#!/bin/bash
cd "$(dirname "$0")"
echo "正在启动 中考人生模拟器 ..."
open "index.html" 2>/dev/null || python3 -m webbrowser "index.html"
echo "已打开。如果没自动弹出，请手动双击 index.html"
