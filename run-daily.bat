@echo off
cd /d "%~dp0"
node make-video.js >> logs\daily-run.txt 2>&1
