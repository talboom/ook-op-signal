# helpers

Developer utilities. Not part of the deployed site.

## generate_badge.py

Generates an "Also on Signal" arc badge PNG in the site's house style, so new
language badges match the existing set in `../images`.

```bash
pip install Pillow
cd helpers
python3 generate_badge.py "MYOS SIGNALISSA" ../images/myossignalissa.png
```

Text is uppercased automatically. Fine-tune centring with `--start-deg` and
`--spacing` (see `python3 generate_badge.py -h`).

Colour is `#3b45fd` (CSS `--color-primary`) and the font is Clash Display Bold
(the site's `--font-display`), bundled here as `ClashDisplay-Bold.ttf`. Clash
Display's heaviest weight is Bold (700) — there is no 900.

### Adding a new language badge

1. Generate `images/<phrase>.png` with this script (ASCII-folded filename,
   e.g. `myössignalissa` -> `myossignalissa.png`, matching `ocksapasignal.png`).
2. In `javascript/language.js`: add the language's `translations` block, add
   its code to both language arrays in `getLanguageFromUrl`, and add it to the
   `overlayImages` map.
3. In `index.html` and `waaromSignal.html`: add a `.language-option` dropdown
   button, and in `index.html` add a `.thumbnail-container` for the badge.
4. Bump the `language.js?v=` cache-busting version in both HTML files.
