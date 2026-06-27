# OBS Streaming Setup

Full guide for "The Vacuum Distillation Channel" 24/7 multistream.

---

## 1. Required software

| Software | Where |
|---|---|
| OBS Studio 30+ | https://obsproject.com/ |
| obs-multi-rtmp plugin | https://github.com/sorayuki/obs-multi-rtmp/releases |
| Python 3.10+ | https://python.org (for the loop-manager script) |

Install OBS, then drop the obs-multi-rtmp plugin into `%APPDATA%\obs-studio\plugins\` and restart OBS.

---

## 2. Scene collection

Import `scenes/vacuum-distill-scenes.json` via **Scene Collection → Import** in OBS.

You'll get two scenes:

### Scene 1: Live Camera
- `Camera` — your webcam or capture card (rename in OBS to match your device name)
- `Microphone` — audio input for ambient rig sounds
- `Channel Branding` — text overlay with channel name + bottom-left watermark
- `Stats Overlay` — optional: temperature, vacuum pressure readout

### Scene 2: Loop Video
- `Loop Source` — a VLC Media Source pointing at your `loops/` folder (set to loop forever)
- `BRB Overlay` — "Switching Setup — Back Soon" text
- `Background Music` — optional audio source (royalty-free music track, loop)

**Scene transition:** 300ms fade to black between scenes.

---

## 3. Multi-RTMP: stream to YouTube + Twitch + Kick simultaneously

After installing obs-multi-rtmp, a **"Multiple RTMP Outputs"** panel appears in OBS.

Click **+** to add each destination:

#### YouTube Live
- Server: `rtmp://a.rtmp.youtube.com/live2`
- Stream key: YouTube Studio → Go Live → Stream key

#### Twitch
- Server: `rtmp://live.twitch.tv/app`
- Stream key: Twitch Creator Dashboard → Settings → Stream → Primary Stream key

#### Kick
- Server: `rtmp://fa723fc1b171.global-contribute.live-video.net/app`
- Stream key: Kick Dashboard → Channel → Stream key

**Recommended output settings for all three:**
- Encoder: NVENC H.264 (or x264 if no GPU)
- Bitrate: 6000 Kbps (acceptable for all three platforms)
- Resolution: 1920×1080
- Frame rate: 30 fps
- Keyframe interval: 2 seconds (required by Twitch)
- Audio: AAC 160 Kbps, 44.1 kHz

---

## 4. Loop manager (auto-switch scenes)

The script `scripts/loop-manager.py` monitors the camera source and auto-switches scenes when the signal drops.

### Setup

```bash
cd obs/scripts
pip install -r requirements.txt
```

### Configure

1. In OBS: **Tools → WebSocket Server Settings → Enable WebSocket server** (port 4455, set a password)
2. Edit `loop-manager.py` — set `OBS_PASSWORD`, `CAMERA_SOURCE`, `LIVE_SCENE`, `LOOP_SCENE`

### Run

```bash
python loop-manager.py
```

Keep this running alongside OBS. It polls every 5 seconds; if the camera disconnects it switches to Loop Video, and switches back when the signal returns.

---

## 5. Loop video files

Drop any `.mp4` or `.mkv` files into the `loops/` folder (sibling of `obs/` in this repo — gitignored because they're large).

Recommended content for the loop:
- A "Be Right Back" branded screen (dark, channel name, estimated return time)
- A timelapse of a previous distillation run (30–60 min compressed to 5–10 min, then loops)
- Soft background music optional

In OBS, the `Loop Source` VLC Media Source should be set to the `loops/` folder with **Loop** checked and **Shuffle** optional.

---

## 6. 24/7 uptime considerations

- **Never-sleep:** Set the streaming PC to never sleep (Windows → Power → Never)
- **Auto-restart OBS on crash:** Use NSSM (`nssm.cc`) to run OBS as a Windows service, or a simple Task Scheduler `OnEvent` trigger on OBS exit
- **Stream health monitor:** Restream.io has a free stream health dashboard even if you're not using their relay; point one output there for monitoring
- **UPS:** Put the streaming PC on a UPS (same recommendation as the EQR6 box) to survive brief power blips

---

## 7. Recommended camera setup

- **Camera:** Any USB webcam with 1080p30 support, or a GoPro/DSLR via HDMI capture card
- **Mount:** Fixed overhead or side angle showing the entire rig
- **Lighting:** Consistent, color-balanced. A ring light or two soft boxes work well. Avoid sunlight (changes throughout the day)
- **Audio:** USB condenser mic or a Zoom H-series recorder into a USB audio interface — the bubbling/gurgling of distillation is great ASMR content
