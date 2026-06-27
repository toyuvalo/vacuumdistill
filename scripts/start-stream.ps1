<#
.SYNOPSIS
  Launches OBS and the loop-manager together. Auto-restarts OBS if it crashes.
  Designed to run at Windows startup via Task Scheduler (see install-startup-task.ps1).
#>

$obsExe      = "C:\Program Files\obs-studio\bin\64bit\obs64.exe"
$loopScript  = "$PSScriptRoot\..\obs\scripts\loop-manager.py"
$configPath  = "$PSScriptRoot\..\stream-config.json"
$logDir      = "$PSScriptRoot\..\logs"
$logFile     = "$logDir\stream-$(Get-Date -Format 'yyyy-MM-dd').log"

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

function Log($msg) {
    $line = "$(Get-Date -Format 'HH:mm:ss') $msg"
    Write-Output $line
    Add-Content $logFile $line
}

# Read obs websocket password from config
$obsPassword = ""
if (Test-Path $configPath) {
    $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
    $obsPassword = $cfg.obs_websocket.password
}

Log "=== Stream session started ==="

# Start loop-manager in the background
$env:OBS_WS_PASSWORD = $obsPassword
$loopJob = Start-Job -ScriptBlock {
    param($script, $pw)
    $env:OBS_WS_PASSWORD = $pw
    python $script
} -ArgumentList $loopScript, $obsPassword

Log "loop-manager started (job $($loopJob.Id))"

# Main OBS watch loop — restart OBS if it exits
while ($true) {
    Log "Starting OBS..."
    $obsproc = Start-Process -FilePath $obsExe -ArgumentList "--minimize-to-tray" -PassThru
    Log "OBS started (PID $($obsproc.Id))"

    $obsproc.WaitForExit()
    $exit = $obsproc.ExitCode
    Log "OBS exited with code $exit"

    if ($exit -eq 0) {
        Log "Clean OBS exit — stopping stream session."
        break
    }

    Log "OBS crashed — restarting in 10s..."
    Start-Sleep -Seconds 10
}

# Clean up loop-manager
Stop-Job $loopJob -ErrorAction SilentlyContinue
Remove-Job $loopJob -ErrorAction SilentlyContinue
Log "=== Stream session ended ==="
