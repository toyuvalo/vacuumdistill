# iPad Streaming Setup — The Vacuum Distillation Channel

Everything runs off a single iPad on a charger. No desktop required.

---

## Step 1 — Create platform accounts (one-time, ~5 min each)

You need accounts on each platform you want to stream to. Skip any you already have.

| Platform | Signup URL |
|---|---|
| YouTube | https://studio.youtube.com → Go Live |
| Twitch | https://www.twitch.tv/signup |
| Kick | https://kick.com/signup |

> **Stream keys** live in each platform's dashboard under "Stream" or "Go Live" settings. You'll need these in Step 3.

---

## Step 2 — Create a Restream.io account (one-time, ~2 min)

Restream takes one video feed from your iPad and forwards it to all three platforms simultaneously.

1. Go to **https://restream.io** and create a free account
2. In your Restream dashboard → **Add Channel** → add YouTube, Twitch, and Kick
3. Restream will ask for stream keys for each platform (copy them from Step 1)
4. Go to **Restream → Settings → Stream** → copy your **RTMP URL** and **Stream Key**
   - It looks like: `rtmp://live.restream.io/live` + `re_XXXXX_XXXXXXXXXXXX`

---

## Step 3 — Install Larix Broadcaster on iPad

**Larix Broadcaster** is a free iOS app that streams your iPad camera to any RTMP endpoint.

1. On your iPad → App Store → search **"Larix Broadcaster"** → install
2. Open Larix → tap the gear icon → **Connections** → **+** (New Connection)
3. Set:
   - **Name:** Restream (Distillation Channel)
   - **URL:** `rtmp://live.restream.io/live/re_XXXXX_XXXXXXXXXXXX` *(paste your full Restream RTMP URL + key combined)*
   - **Video:** 1080p, 6000 Kbps
   - **Audio:** AAC, 128 Kbps
4. Tap **Save**

---

## Step 4 — Configure the iPad for 24/7 operation

1. **Settings → Display & Brightness → Auto-Lock → Never** (keeps screen on)
2. **Settings → General → Background App Refresh → Off** (saves battery, Larix keeps streaming in background anyway)
3. **Settings → Do Not Disturb → On** (no interruptions during stream)
4. Plug into charger — leave connected
5. Prop iPad with the camera facing the distillation rig (a simple phone stand or clamp arm works well)

---

## Step 5 — Go live

1. Open Larix Broadcaster
2. Tap the red **Record/Broadcast** button → **Live Broadcast**
3. You're live on YouTube + Twitch + Kick simultaneously

To stop: tap the button again.

---

## Adding a second camera (authorized only)

You can add other cameras as additional sources in Restream — but each camera must be **explicitly added to `stream-config.json`** in this repo first, as a record that it was authorized.

> ⚠️ **Security cams (Frigate, NoBreak) are NEVER added here.** Home security cameras must NEVER appear as a source in this repo's config or in the Restream account. This is a hard rule — no exceptions.

### How to add an authorized camera

Options for extra camera sources:

**Option A — Another iPhone/iPad**
- Install Larix Broadcaster on it
- Create a second "Preview" connection in Restream → **Studio → Add Source → RTMP Source**
- Restream will give you a second RTMP ingest URL for that camera
- Enter that URL in Larix on the second device

**Option B — IP camera or action cam with RTSP output**
- Use **RTSP to RTMP relay** via ffmpeg (Windows/Mac/Linux):
  ```
  ffmpeg -i "rtsp://camera-ip/stream" -c copy -f flv rtmp://live.restream.io/live/CAMERA_KEY
  ```
- Or use **OBS Studio** (Windows) → add RTSP source → output to Restream

**Option C — USB webcam on a PC**
- OBS Studio on Windows/Mac → add camera → output to Restream
- See `../obs/README.md` for full OBS setup

### Recording the authorization

When you add a camera, add an entry to `stream-config.json`:

```json
"authorized_cameras": [
  {
    "name": "Distillation Rig (Main)",
    "source": "iPad front camera",
    "authorized": "2026-06-27",
    "note": "Primary stream camera"
  }
]
```

---

## Handling changeovers (loop video while switching setups)

**Simple approach (free):** When you're switching what you're distilling, just leave the iPad pointed at the idle rig. Viewers see the empty setup — that's honest and fine.

**Better approach — Restream Scheduler (paid, ~$16/mo):**
Restream Scheduler lets you pre-load an MP4 "BRB" video that plays automatically when your stream goes offline. You can also use it to play a looping countdown/timelapse between live runs.

- Restream Dashboard → **Scheduler** → upload your BRB video → set it to loop
- When you stop Larix, Restream automatically starts playing the video loop

---

## Updating the website with your channel links

Once you have your platform URLs, update `docs/poll.json`:

```json
"platforms": {
  "youtube": "https://www.youtube.com/@YourChannel",
  "twitch":  "https://www.twitch.tv/YourTwitchName",
  "kick":    "https://kick.com/YourKickName"
}
```

Then commit and push — the site updates automatically.
