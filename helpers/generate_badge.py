#!/usr/bin/env python3
"""Generate an "Also on Signal" arc badge PNG in the site's house style.

The badges in ../images (alsoonsignal.png, ookopsignal.png, ...) are a blue
arc hugging the bottom-left of a 500x500 transparent square, with white bold
uppercase text curved along it and both ends fading out. This script recreates
that exact geometry so new language badges match the existing set.

Geometry reverse-engineered from images/alsoonsignal.png:
  canvas    500x500, transparent
  centre    (250, 250)
  annulus   inner r=174, outer r=252, colour #3B45FD (Signal brand blue,
            = CSS --color-primary)
  arc span  (screen angles, 0=right / 90=down) solid 62..184 deg,
            fades in 38..62, fades out 184..211
  text      radius ~212, white, Clash Display Bold (the site's --font-display),
            "up" pointing toward centre

Usage:
  python3 generate_badge.py "MYOS SIGNALISSA" ../images/myossignalissa.png
  python3 generate_badge.py "MYÖS SIGNALISSA" out.png --font-size 46 \
      --start-deg 182 --spacing 1.06

Text is uppercased automatically. Keep it to ~14-15 glyphs (incl. spaces) so it
fits the arc, matching phrases like "ALSO ON SIGNAL" / "OOK OP SIGNAL". Tune
--start-deg (higher = shift text counter-clockwise / toward top-left) and
--spacing to centre the text within the arc.

Requires: Pillow  (pip install Pillow)
"""
import argparse
import math
import os

from PIL import Image, ImageDraw, ImageFont

# --- house-style constants (do not change; matched to the existing badges) ---
SS = 4                                  # supersampling factor for smooth edges
S = 500 * SS                            # working canvas size
CX = CY = 250 * SS                      # centre
R_IN, R_OUT = 174 * SS, 252 * SS        # annulus radii
R_TEXT = 212 * SS                       # text baseline radius (annulus midline)
BLUE = (59, 69, 253)                    # #3B45FD, = CSS --color-primary
# Clash Display Bold (the site's --font-display). Bundled next to this script;
# Clash Display's heaviest weight is Bold (700) — there is no 900.
FONT_PATH = os.path.join(os.path.dirname(__file__), "ClashDisplay-Bold.ttf")
FONT_INDEX = 0

# angular envelope of the arc, in screen degrees (0=right, 90=down)
A_FADE_IN0, A_FADE_IN1 = 38, 62
A_FADE_OUT0, A_FADE_OUT1 = 184, 211


def _band_alpha(deg):
    """Opacity multiplier (0..1) of the arc at a given angle, giving the
    soft fade at both ends."""
    if deg < A_FADE_IN0 or deg > A_FADE_OUT1:
        return 0.0
    if deg < A_FADE_IN1:
        return (deg - A_FADE_IN0) / (A_FADE_IN1 - A_FADE_IN0)
    if deg <= A_FADE_OUT0:
        return 1.0
    return 1.0 - (deg - A_FADE_OUT0) / (A_FADE_OUT1 - A_FADE_OUT0)


def _draw_annulus(img):
    px = img.load()
    for y in range(S):
        dy = y - CY
        for x in range(S):
            dx = x - CX
            r = math.hypot(dx, dy)
            if r < R_IN - 1 or r > R_OUT + 1:
                continue
            deg = math.degrees(math.atan2(dy, dx)) % 360
            a = _band_alpha(deg)
            if a <= 0:
                continue
            # 1px (at SS scale) anti-aliased radial edges
            edge = 1.0
            if r < R_IN:
                edge = max(0.0, r - (R_IN - SS)) / SS
            elif r > R_OUT - SS:
                edge = max(0.0, (R_OUT - r) / SS)
            alpha = int(255 * a * edge)
            if alpha > 0:
                px[x, y] = (*BLUE, alpha)


def _draw_text(img, text, font_size, start_deg, spacing):
    """Lay glyphs along the arc. Reading order left->right corresponds to
    angle decreasing; each glyph is rotated so its "up" points to the centre
    (rot=0 at the bottom of the arc)."""
    font = ImageFont.truetype(FONT_PATH, font_size, index=FONT_INDEX)
    measure = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    widths = []
    for ch in text:
        bb = measure.textbbox((0, 0), ch, font=font)
        widths.append(font_size * 0.35 if ch == " " else bb[2] - bb[0])

    ang = start_deg
    for ch, w in zip(text, widths):
        adv_deg = math.degrees((w * spacing) / R_TEXT)
        cdeg = ang - adv_deg / 2.0
        rad = math.radians(cdeg)
        gx = CX + R_TEXT * math.cos(rad)
        gy = CY + R_TEXT * math.sin(rad)
        rot = 90 - cdeg                         # up -> toward centre
        pad = font_size
        tile = Image.new("RGBA", (pad * 2, pad * 2), (0, 0, 0, 0))
        d = ImageDraw.Draw(tile)
        bb = d.textbbox((0, 0), ch, font=font)
        cw, chh = bb[2] - bb[0], bb[3] - bb[1]
        d.text((pad - cw / 2 - bb[0], pad - chh / 2 - bb[1]), ch,
               font=font, fill=(255, 255, 255, 255))
        tile = tile.rotate(rot, resample=Image.BICUBIC, center=(pad, pad))
        img.alpha_composite(tile, (int(gx - pad), int(gy - pad)))
        ang -= adv_deg


def generate(text, out_path, font_size=46, start_deg=182.0, spacing=1.06):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    _draw_annulus(img)
    _draw_text(img, text.upper(), font_size * SS, start_deg, spacing)
    img.resize((500, 500), Image.LANCZOS).save(out_path)
    return out_path


def main():
    p = argparse.ArgumentParser(description="Generate an 'Also on Signal' badge PNG.")
    p.add_argument("text", help='Badge text, e.g. "MYOS SIGNALISSA"')
    p.add_argument("out", help="Output PNG path, e.g. ../images/myossignalissa.png")
    p.add_argument("--font-size", type=int, default=46)
    p.add_argument("--start-deg", type=float, default=182.0,
                   help="Angle of the first glyph's leading edge (higher shifts text toward top-left)")
    p.add_argument("--spacing", type=float, default=1.06, help="Letter-spacing multiplier")
    a = p.parse_args()
    generate(a.text, a.out, a.font_size, a.start_deg, a.spacing)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
