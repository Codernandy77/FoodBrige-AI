$gitExe = "C:\Users\admin\git\cmd\git.exe"

Set-Location "E:\New Folder"

Write-Host "Configuring safe directory..."
& $gitExe config --global --add safe.directory "*"

Write-Host "Initializing Git Repository..."
& $gitExe init

Write-Host "Configuring Git identity..."
& $gitExe config user.name "Codernandy77"
& $gitExe config user.email "codernandy77@users.noreply.github.com"

Write-Host "Adding all project files..."
& $gitExe add .

Write-Host "Committing project files..."
& $gitExe commit -m "Initial commit: FoodBridge AI full-stack application with benchmarks and documentation"

Write-Host "Setting main branch..."
& $gitExe branch -M main

Write-Host "Configuring remote origin..."
& $gitExe remote remove origin 2>$null
& $gitExe remote add origin https://github.com/Codernandy77/FoodBrige-AI.git

Write-Host "Pushing code to GitHub..."
& $gitExe push -u origin main --force 2>&1
