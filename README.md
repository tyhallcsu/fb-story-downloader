<div align="center">

<img src="icon.svg" width="72" height="72" alt="">

# Story Downloader — Facebook & Instagram (Single + Bulk)

**Download a single story slide, or every slide in a user's reel individually, with one click.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Userscript](https://img.shields.io/badge/type-userscript-brightgreen.svg)](story-downloader-bulk.user.js)
[![Platform](https://img.shields.io/badge/platform-Facebook%20%7C%20Instagram-1877F2.svg)](#)

</div>

---

A bulk-download fork of [oscar370's **Story Downloader**](https://greasyfork.org/scripts/507431) (GPL3). Every bit of the original single-slide behavior is preserved — this just adds a second **"⬇ ALL"** button that grabs the whole reel.

## Install

1. Install a userscript manager — [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Install from **[GreasyFork](https://greasyfork.org/en/scripts/587245)**, or click the raw file: **[story-downloader-bulk.user.js](https://raw.githubusercontent.com/tyhallcsu/fb-story-downloader/main/story-downloader-bulk.user.js)**
3. Open any Facebook or Instagram **story** (`/stories/…`) — the buttons appear in the story's top bar.

## Features

- **⬇ (single)** — download just the slide you're currently viewing (original behavior).
- **⬇ ALL** — walk the entire reel and download each slide as its own file:
  `username-2026-07-16-01.mp4`, `-02.jpg`, `-03.mp4`, …
- Handles **videos and images**, on **Facebook & Instagram**, desktop and Facebook mobile.
- Live progress on the button: `Capturing 3…` → `Downloading 2/7` → `Done: 7`.
- Stops automatically at end of reel, when it rolls into the next person's story, or at a 200-slide safety cap.

## How the bulk grab works

1. Records the current story owner's username as the "session owner."
2. Detects the current slide's media (video via React-fiber prop inspection, image via CDN detection) and queues it.
3. Advances to the next slide — clicks the native **Next** control, or dispatches an `ArrowRight` key event.
4. Waits for the media URL *or* username to actually change (up to ~3.5s).
5. Repeats until an automatic stop condition, then downloads every queued item individually.

> **Tip:** if a reel auto-advances very fast, pause it before clicking **ALL** so each video has time to load. On slow connections, bump `BULK_SLIDE_WAIT_MS` near the top of the script.

## Notes

- Only downloads content **you can already view** in your own logged-in session.
- Everything runs locally in your browser (`@grant none`); no data is sent anywhere beyond fetching the media the page already loads.

## Credits

- Original **Story Downloader – Facebook and Instagram** by **oscar370** — <https://greasyfork.org/scripts/507431>
- Bulk "download all slides" feature by **sharmanhall**
- Licensed **[GPL-3.0](LICENSE)**, same as the original.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
