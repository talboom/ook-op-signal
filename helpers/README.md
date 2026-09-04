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

### Badge variants

Every language has two badges: the default "Also on Signal" one
(`overlayImages` in `javascript/language.js`) and the alternative
"Rather on Signal" one (`overlayImagesRather`), for people who already left
WhatsApp. Both are offered in the thumbnail row; the default one is
pre-selected.

The alternative phrases are longer than the default ones, so they were
generated with a smaller `--font-size` and a `--start-deg` that keeps the text
centred in the arc. Rule of thumb: pick the largest font size whose text spans
at most ~130 degrees, then set `--start-deg` to `123 + span / 2`
(123 deg is the middle of the solid arc). For example:

```bash
python3 generate_badge.py "LIEVER OP SIGNAL" ../images/lieveropsignal.png \
    --font-size 46 --start-deg 187.8
python3 generate_badge.py "MIELUITEN SIGNALISSA" ../images/mieluitensignalissa.png \
    --font-size 37 --start-deg 187.9
```

### Adding a new language badge

1. Generate both `images/<phrase>.png` files with this script (ASCII-folded
   filenames, e.g. `myössignalissa` -> `myossignalissa.png`, matching
   `ocksapasignal.png`).
2. In `javascript/language.js`: add the language's `translations` block
   (including `badge.also` and `badge.rather`, which label the thumbnails and
   must match the badge texts), add its code to both language arrays in
   `getLanguageFromUrl`, and add it to the `overlayImages` and
   `overlayImagesRather` maps.
3. In `index.html` and `waaromSignal.html`: add a `.language-option` dropdown
   button, and in `index.html` add a `.thumbnail-container` per badge — one
   with `data-badge-variant="also"` and `class="thumbnail thumbnail-<lang>"`,
   one with `data-badge-variant="rather"` and
   `class="thumbnail thumbnail-<lang>-rather"`.
4. Bump the `language.js?v=` cache-busting version in both HTML files.
