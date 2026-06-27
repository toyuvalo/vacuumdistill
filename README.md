# The Vacuum Distillation Channel

> 24/7 vacuum distillation livestream — simultaneously live on YouTube, Twitch, and Kick. Runs off a single iPad on a charger, pointed at the rig.

**Website:** https://toyuvalo.github.io/vacuumdistill  
**YouTube:** *(add after setup)*  
**Twitch:** *(add after setup)*  
**Kick:** *(add after setup)*

---

## Setup (iPad, ~15 minutes total)

See **[ipad/SETUP.md](ipad/SETUP.md)** for the full step-by-step guide.

**TL;DR:**
1. Create [Restream.io](https://restream.io) account → connect YouTube, Twitch, Kick → copy RTMP URL + key
2. Install **Larix Broadcaster** on iPad (free, App Store)
3. In Larix → Connections → New → paste Restream RTMP URL + key
4. iPad Settings → Display & Brightness → Auto-Lock → **Never**
5. Plug in charger, prop up iPad pointed at the rig, tap **Broadcast**

That's it. You're live on all three platforms at once.

---

## Switching setups / going offline

- Point the iPad at a "BRB" card or leave it on the idle rig during changeovers
- Tap **Stop** in Larix when fully offline; Restream will show your channel as offline

For automated looping videos during changeovers, see `ipad/SETUP.md` → Restream Scheduler (paid feature, optional).

---

## Voting (what to distill next)

The [website](https://toyuvalo.github.io/vacuumdistill) shows a live poll. Viewers vote by 👍 reacting to GitHub Issues [#1–#4](https://github.com/toyuvalo/vacuumdistill/issues). 

To rotate the poll: open new Issues, edit `docs/poll.json`, push.

## Repository structure

```
vacuumdistill/
├── docs/            # GitHub Pages site
├── ipad/            # iPad streaming setup guide + config
├── obs/             # Optional: Windows OBS setup (if you ever want a PC streamer)
├── loops/           # Loop video files (gitignored)
└── stream-config.json  # Your stream keys (gitignored — never committed)
```
