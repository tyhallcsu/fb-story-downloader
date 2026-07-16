# Changelog

## v2.4.0 — Listing polish

- Added a script **icon** (Facebook↔Instagram gradient download badge).
- Polished GreasyFork metadata: clearer `@name` (**Story Downloader — Facebook & Instagram (Single + Bulk)**), `@author sharmanhall`, rewritten `@description`.
- Added `@homepageURL` and `@supportURL` pointing to the GitHub repo.

## v2.3.0 — Bulk download

Forked from [Story Downloader – Facebook and Instagram v2.2.2](https://greasyfork.org/scripts/507431) by oscar370 (GPL3).

### Added
- **"⬇ ALL" button** — downloads every slide in the current user's story reel individually, in one click.
  - Auto-advances through slides (clicks the native **Next** control, falls back to an `ArrowRight` key event).
  - Captures each slide's media (video via React-fiber prop inspection, image via CDN detection) into a queue, then downloads each as a separate file: `username-YYYY-MM-DD-01.mp4`, `-02.jpg`, …
  - Live status readout on the button: `Capturing N…`, `Downloading i/N`, `Done: N`.
  - Automatic stop conditions: end of reel (same media URL seen twice), rollover into the next user's story (username change), no media found, or a 200-slide safety cap.
  - Mutation observer is paused during a bulk run so slide changes don't tear down / rebuild the buttons mid-capture.

### Preserved
- Original single-slide download button and all v2.2.2 detection logic (video + image, Facebook + Instagram, desktop + FB mobile).
