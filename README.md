# The Vacuum Distillation Channel

> 24/7 livestream of vacuum distillation experiments — live on YouTube, Twitch, and Kick.

**Website:** https://toyuvalo.github.io/vacuumdistill  
**YouTube:** *(add link after channel creation)*  
**Twitch:** *(add link)*  
**Kick:** *(add link)*

---

## What this is

A single fixed camera pointed at a vacuum distillation rig, streaming continuously. During setup changes, a pre-recorded loop plays. Viewers vote on what gets distilled next via GitHub Issues.

## Repository structure

```
vacuumdistill/
├── docs/               # GitHub Pages site (live at toyuvalo.github.io/vacuumdistill)
│   ├── index.html      # Landing page with stream embed + polls + platform links
│   ├── style.css
│   ├── app.js
│   └── poll.json       # Active poll — edit this to update the current vote
├── obs/
│   ├── README.md       # Full streaming setup guide (OBS + multi-RTMP)
│   ├── scenes/
│   │   └── vacuum-distill-scenes.json   # OBS scene collection template
│   └── scripts/
│       ├── loop-manager.py   # Auto-switches to loop when camera loses signal
│       └── requirements.txt
├── loops/              # Drop looping video files here (gitignored — too large)
│   └── README.md
└── .github/
    └── workflows/
        └── pages.yml   # Deploys docs/ to GitHub Pages
```

## Quick start

1. **Streaming PC:** Install [OBS Studio](https://obsproject.com/) and the [obs-multi-rtmp plugin](https://github.com/sorayuki/obs-multi-rtmp)
2. **Scenes:** Import `obs/scenes/vacuum-distill-scenes.json` into OBS
3. **Stream keys:** Add your YouTube / Twitch / Kick keys to the Multi-RTMP panel
4. **Loop videos:** Drop `.mp4` files into the `loops/` folder on the streaming PC and point the OBS Loop scene's VLC source at it
5. **Auto-switcher:** `pip install -r obs/scripts/requirements.txt && python obs/scripts/loop-manager.py`
6. **Voting:** Edit `docs/poll.json` to update the current poll, open GitHub Issues for each option (see `docs/app.js` for the issue-number mapping)

See `obs/README.md` for the full streaming setup guide.

## How voting works

- `docs/poll.json` defines the current poll question and maps each option to a GitHub Issue number
- The site fetches 👍 reaction counts from those Issues via the GitHub REST API (no auth needed for public repos)
- Clicking "Vote" opens the Issue so the viewer can add a 👍
- Update `poll.json` to rotate polls; close old Issues and open new ones

## Updating "Now Distilling"

Edit `docs/poll.json` → `now_distilling` field and push. The site reads it directly from the repo via the GitHub raw CDN.
