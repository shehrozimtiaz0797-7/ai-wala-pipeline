@echo off
cd /d "%~dp0"
echo.
echo  AI Wala - daily automatic video
echo  ---------------------------------
set /p RUNTIME="What time should it run every day? (24-hour, e.g. 10:00 or 21:30): "
if "%RUNTIME%"=="" set RUNTIME=10:00
schtasks /Create /F /SC DAILY /ST %RUNTIME% /TN "AI Wala Daily Video" /TR "\"%~dp0run-daily.bat\""
if errorlevel 1 (
  echo.
  echo  Could not create the task. Right-click this file and choose "Run as administrator".
) else (
  echo.
  echo  Done! A new video will be made and uploaded every day at %RUNTIME%.
  echo  The computer must be ON at that time.
  echo  To stop it later, run: remove-schedule.bat
)
echo.
pause
