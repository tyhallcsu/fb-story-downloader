# Story Downloader — Facebook & Instagram (Single + Bulk)

Download stories (videos **and** images) from Facebook and Instagram — either **one slide at a time** or the **entire reel at once**, each saved as its own file.

This is a bulk-download fork of [oscar370's Story Downloader](https://greasyfork.org/scripts/507431) (GPL3). All original single-slide functionality is preserved; a second **"⬇ ALL"** button is added next to it.

---

## Features

- **⬇ (single)** — download just the slide you're currently viewing. Same behavior as the original script.
- **⬇ ALL** — walk through every slide in the current user's story and download each one individually (`username-2026-07-16-01.mp4`, `-02.jpg`, `-03.mp4`, …).
- Works with both **videos** and **images**.
- **Facebook & Instagram**, desktop and Facebook mobile.
- Live progress on the button: `Capturing 3…` → `Downloading 2/7` → `Done: 7`.
- Smart stop conditions — it ends automatically when it reaches the last slide, when the reel rolls over into the *next* person's story, or after a safety cap of 200 slides.

## How to use

1. Install a userscript manager ([Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)).
2. Install this script.
3. Open any Facebook or Instagram **story** (`/stories/…`).
4. Two download buttons appear in the story's top bar:
   - the **single** icon downloads the current slide;
   - the **ALL** icon captures every slide and downloads them individually.

> **Tip:** If a reel auto-advances very fast, pause the story before clicking **ALL** so each video has time to load. If slides are slow to load on your connection, increase `BULK_SLIDE_WAIT_MS` near the top of the script.

## Notes

- Only downloads content **you can already view** in your own browser session.
- No data is sent anywhere — everything runs locally in your browser using the media URLs the page already loads.
- `@grant none`, no external requests beyond fetching the media itself.

## Credits

- Original **Story Downloader – Facebook and Instagram** by **oscar370** — https://greasyfork.org/scripts/507431
- Bulk "download all slides" feature by **sharmanhall**
- Licensed **GPL-3.0**, same as the original.
