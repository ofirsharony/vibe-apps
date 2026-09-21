# Marketing video — בנייה מודרכת

Product-launch clip for the guided-build feature, recorded from the real app with Playwright (system Chrome) and rendered to MP4.

## Files

- `record.js` — the story. Drives the UI with an eased, visible cursor; injects text overlays, spotlight and zoom into the page
  so they are captured in the recording; transcodes to MP4 at the end.
- `scenes.json` — every overlay's title, subtitle and hold time (ms), viewport size, app URL, `trimHead` (seconds cut from the
  cold-start), `cursorSpeed` (steps per cursor move).
- `out/lego-guided-build.mp4` — final video (H.264, 1280×800, 30 fps). `out/lego-guided-build.webm` is the raw capture.
- `out/frames/` — sample frames used to verify the cut.

## Re-render

```bash
# 1. serve the repo root
cd <repo root> && python3 -m http.server 8765
# 2. full ffmpeg with libx264 (Playwright's bundled ffmpeg can only write WebM)
npm i --prefix "$TMPDIR/ff" ffmpeg-static        # or: brew install ffmpeg, then FFMPEG=/opt/homebrew/bin/ffmpeg
# 3. record + transcode (~2 min)
FFMPEG="$TMPDIR/ff/node_modules/ffmpeg-static/ffmpeg" node lego-studio/video/record.js
```

## Editing

- Text or timing: edit `scenes.json`, re-run.
- Story beats: each numbered block in `run()` is one scene. `d.overlay(key, pos)` shows a caption (`pos` = `top` | `center` |
  bottom), `d.spot(selector)` dims everything but one element, `d.zoom(scale, x, y)` zooms the page, `d.click(x, y)` /
  `d.clickEl(selector)` move the cursor and click, `d.speed` scales all pauses (used to speed up the later build steps).
