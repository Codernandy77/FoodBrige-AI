Write-Host "========================================================" -ForegroundColor Green
Write-Host "  FoodBridge AI - Push to GitHub" -ForegroundColor Green
Write-Host "  Repository: https://github.com/Codernandy77/FoodBrige-AI" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

git init
git add .
git commit -m "Initial commit: FoodBridge AI full-stack application"
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/Codernandy77/FoodBrige-AI.git
git push -u origin main --force

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Done! Repository pushed successfully to GitHub." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
