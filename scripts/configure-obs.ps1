<#
.SYNOPSIS
  Reads stream-config.json and writes stream keys into OBS multi-rtmp's config file.
  Run this once after filling in stream-config.json, then restart OBS.
#>

$configPath   = "$PSScriptRoot\..\stream-config.json"
$obsMultiPath = "$env:APPDATA\obs-studio\plugin_config\obs-multi-rtmp"

if (-not (Test-Path $configPath)) {
    Write-Error "stream-config.json not found at $configPath — fill it in first."
    exit 1
}

$cfg = Get-Content $configPath -Raw | ConvertFrom-Json

# Build obs-multi-rtmp config
$targets = @()

if ($cfg.platforms.youtube.stream_key -notmatch "PASTE") {
    $targets += @{
        name       = "YouTube"
        server     = "rtmp://a.rtmp.youtube.com/live2"
        key        = $cfg.platforms.youtube.stream_key
        enabled    = $true
        sync_start = $false
        type       = 0
    }
    Write-Output "  + YouTube"
}

if ($cfg.platforms.twitch.stream_key -notmatch "PASTE") {
    $targets += @{
        name       = "Twitch"
        server     = "rtmp://live.twitch.tv/app"
        key        = $cfg.platforms.twitch.stream_key
        enabled    = $true
        sync_start = $false
        type       = 0
    }
    Write-Output "  + Twitch"
}

if ($cfg.platforms.kick.stream_key -notmatch "PASTE") {
    $targets += @{
        name       = "Kick"
        server     = "rtmp://fa723fc1b171.global-contribute.live-video.net/app"
        key        = $cfg.platforms.kick.stream_key
        enabled    = $true
        sync_start = $false
        type       = 0
    }
    Write-Output "  + Kick"
}

if ($targets.Count -eq 0) {
    Write-Warning "No stream keys found — fill in stream-config.json first."
    exit 1
}

New-Item -ItemType Directory -Path $obsMultiPath -Force | Out-Null
$obsMultiConfig = @{ targets = $targets } | ConvertTo-Json -Depth 5
$obsMultiConfig | Set-Content "$obsMultiPath\config.json" -Encoding UTF8
Write-Output "`nOBS multi-rtmp configured with $($targets.Count) output(s). Restart OBS for changes to take effect."

# Also update docs/poll.json with platform URLs (so the website buttons work)
$pollPath = "$PSScriptRoot\..\docs\poll.json"
$poll = Get-Content $pollPath -Raw | ConvertFrom-Json

$poll | Add-Member -NotePropertyName "platforms" -NotePropertyValue @{
    youtube = $cfg.platforms.youtube.channel_url
    twitch  = $cfg.platforms.twitch.channel_url
    kick    = $cfg.platforms.kick.channel_url
} -Force

$poll | ConvertTo-Json -Depth 10 | Set-Content $pollPath -Encoding UTF8
Write-Output "Updated docs/poll.json with platform URLs."
Write-Output "Run: git -C '$PSScriptRoot\..' add docs/poll.json && git commit -m 'Update platform links' && git push"
