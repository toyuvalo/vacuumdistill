"""
loop-manager.py — auto-switches OBS scenes based on camera signal presence.

Requires:
  - OBS Studio 28+ (WebSocket v5 built in)
  - obs-websocket-py: pip install obs-websocket-py

Configure the constants below, then: python loop-manager.py
"""

import time
import logging
from obswebsocket import obsws, requests as obs_req, exceptions

# ── Config ─────────────────────────────────────────────────────
OBS_HOST       = 'localhost'
OBS_PORT       = 4455           # OBS WebSocket v5 default port
OBS_PASSWORD   = 'your-obs-websocket-password-here'

LIVE_SCENE     = 'Live Camera'  # Name of the scene with the real camera
LOOP_SCENE     = 'Loop Video'   # Name of the scene with VLC loop source
CAMERA_SOURCE  = 'Camera'       # Name of the Video Capture Device source in OBS

POLL_INTERVAL  = 5              # Seconds between camera checks
# ───────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S',
)
log = logging.getLogger('loop-manager')


def is_camera_active(ws: obsws) -> bool:
    """Return True if the camera source currently has an active video signal."""
    try:
        r = ws.call(obs_req.GetSourceActive(sourceName=CAMERA_SOURCE))
        return bool(r.getVideoActive())
    except Exception:
        return False


def current_scene(ws: obsws) -> str:
    try:
        r = ws.call(obs_req.GetCurrentProgramScene())
        return r.getCurrentProgramSceneName()
    except Exception:
        return ''


def switch_to(ws: obsws, scene: str):
    try:
        ws.call(obs_req.SetCurrentProgramScene(sceneName=scene))
        log.info('Switched to scene: %s', scene)
    except Exception as e:
        log.error('Failed to switch scene: %s', e)


def main():
    log.info('Connecting to OBS WebSocket at %s:%d …', OBS_HOST, OBS_PORT)
    ws = obsws(OBS_HOST, OBS_PORT, OBS_PASSWORD)

    try:
        ws.connect()
    except exceptions.ConnectionFailure as e:
        log.error('Cannot connect to OBS: %s', e)
        log.error('Make sure OBS is running and WebSocket server is enabled (Tools → WebSocket Server Settings)')
        return

    log.info('Connected. Monitoring camera source "%s" every %ds.', CAMERA_SOURCE, POLL_INTERVAL)
    log.info('Live scene: "%s" | Loop scene: "%s"', LIVE_SCENE, LOOP_SCENE)

    camera_was_active = is_camera_active(ws)
    log.info('Initial camera state: %s', 'ACTIVE' if camera_was_active else 'INACTIVE')

    try:
        while True:
            camera_active = is_camera_active(ws)

            if camera_was_active and not camera_active:
                log.warning('Camera signal LOST — switching to loop')
                switch_to(ws, LOOP_SCENE)

            elif not camera_was_active and camera_active:
                log.info('Camera signal RESTORED — switching to live')
                switch_to(ws, LIVE_SCENE)

            camera_was_active = camera_active
            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        log.info('Stopped by user.')
    finally:
        ws.disconnect()


if __name__ == '__main__':
    main()
