@echo off
cd /d "C:\STAFFRONE WEBSITE"

set /p msg=Enter update message:

git add .
git commit -m "%msg%"
git push

pause