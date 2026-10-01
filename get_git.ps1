$zipPath = "$env:TEMP\MinGit.zip"
$gitDir = "C:\Users\admin\git"

if (-not (Test-Path "$gitDir\cmd\git.exe")) {
    Write-Host "Downloading MinGit portable..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/MinGit-2.44.0-64-bit.zip" -OutFile $zipPath
    Write-Host "Extracting MinGit..."
    Expand-Archive -Path $zipPath -DestinationPath $gitDir -Force
}

$gitExe = "$gitDir\cmd\git.exe"
& $gitExe --version
