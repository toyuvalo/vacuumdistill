# Loop Videos

Drop your loop video files here (`.mp4`, `.mkv`, `.mov`).

This folder is **gitignored** — files are too large for Git. Store them locally on the streaming PC.

## Recommended loop content

| Type | Purpose | Length |
|---|---|---|
| `brb-screen.mp4` | Branded "Be Right Back" screen | Any |
| `timelapse-lavender.mp4` | Previous run timelapse | 5–15 min |
| `intro-reel.mp4` | Channel intro / about | 2–5 min |

## Production tips

- Keep all loop videos at 1920×1080, 30fps, H.264 (same as stream output) — no re-encoding needed
- Use ffmpeg to compress long recordings: `ffmpeg -i input.mp4 -c:v libx264 -crf 22 -preset medium output.mp4`
- Handbrake preset "Fast 1080p30" also works well

## OBS setup

In OBS → Loop Video scene → `Loop Source` (VLC Media Source):
1. Click the source → Properties
2. Set playlist to this `loops/` folder path
3. Check **Loop** ✓
4. Optionally check **Shuffle** for variety
