# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Ook op Signal" (Also on Signal) is a client-side web tool that lets users add a language-specific "Also on Signal" badge overlay to their profile picture. The tool encourages people to switch from WhatsApp to Signal. Live at [signalbadge.eu](https://www.signalbadge.eu) / [ookopsignal.eu](https://www.ookopsignal.eu).

## Tech Stack

- Static site with vanilla HTML/CSS/JavaScript (no build system, no bundler, no framework)
- CSS framework: Bulma 0.9.3 (via CDN)
- Icons: Font Awesome 6.5 (via CDN)
- Backend: Single PHP file (`analytics.php`) for page/click analytics with MySQL
- No package manager, no test framework

## Development

Open `index.html` directly in a browser or serve with any static file server. No build step required.

## Architecture

**Two pages:**
- `index.html` — Main tool page (upload photo, position crop, select badge, download)
- `waaromSignal.html` — "Why Signal?" informational page

**JavaScript modules (loaded as separate `<script>` tags, order matters):**
1. `javascript/burger.js` — Mobile navbar hamburger menu toggle
2. `javascript/language.js` — i18n system: contains all translations as a `translations` object and `overlayImages` language-to-badge mapping. Reads `?lang=` URL param, falls back to browser language, defaults to `nl`. Exposes global functions (`getLanguageFromUrl`, `setLanguage`, `translatePage`) and the `overlayImages` map used by other scripts
3. `javascript/upload.js` — Image upload handling, canvas rendering, spotlight (crop area) setup with resize handles. Depends on globals from `language.js` (`overlayImages`, `lang`)
4. `javascript/drag.js` — Makes the spotlight/crop area draggable and resizable (mouse + touch + pinch-to-zoom)
5. `javascript/download.js` — Crops image to spotlight area, composites the selected badge overlay, and triggers PNG download. Depends on globals from `language.js`
6. `javascript/analytics.js` — Sends page_visits/upload_clicks/download_clicks events to `analytics.php`

**Internationalization:**
- 10 languages: cs, de, en, es, fr, it, nl, pl, pt, sv
- All translations live in the `translations` object in `language.js`
- HTML elements use `data-i18n="key"` attributes; `translatePage()` sets innerHTML from translations
- `data-lang-only="nl"` hides/shows content for specific languages (used for NL-only "learn more" links)
- Internal links use `data-internal="true"` and `{{lang}}` placeholder in href, replaced at runtime
- Each language has a corresponding badge overlay PNG in `images/` (e.g., `alsoonsignal.png`, `ookopsignal.png`)

**Image processing pipeline (all client-side, no server upload):**
1. User uploads image → drawn to hidden `<canvas>`
2. A draggable/resizable "spotlight" div lets user select the crop area
3. On download: crop area coordinates are mapped back to canvas pixels, cropped to max 800x800, then the selected badge PNG is composited on top
