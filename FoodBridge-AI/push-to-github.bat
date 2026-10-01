@echo off
echo ========================================================
echo   FoodBridge AI - Push to GitHub
echo   Repository: https://github.com/Codernandy77/FoodBrige-AI
echo ========================================================
echo.

git init
git add .
git commit -m "Initial commit: FoodBridge AI full-stack application"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Codernandy77/FoodBrige-AI.git
git push -u origin main --force

echo.
echo ========================================================
echo   Done! Repository pushed successfully to GitHub.
echo ========================================================
pause
