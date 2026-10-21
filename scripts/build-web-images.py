"""
Web-sized copies of every image the Prismic fixtures point at, so fixture
mode (tests, offline demo, the automatic fallback when Prismic is down) does
not ship the multi-megabyte source PNGs. Live mode already gets compressed
images from Prismic's imgix CDN.

    python scripts/build-web-images.py

Reads src/fixtures/prismic-documents.json, finds every image file it names,
and writes public/Images/web/<name>.webp (alpha kept, longest side capped).
src/lib/prismic-fixtures.ts rewrites fixture image URLs to these files.
"""

import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "Images"
OUT = SRC / "web"
FIXTURES = ROOT / "src" / "fixtures" / "prismic-documents.json"

# Same pattern the fixture loader uses to map Prismic CDN URLs to local files.
PATTERN = re.compile(r"https://images\.prismic\.io/[\w-]+/[\w-]+?_([^\"?]+\.(?:png|jpe?g|webp|avif|gif))")

MAX_SIDE = 1600  # the largest any of these is drawn, at 2x, is ~1400px
QUALITY = 80


def main() -> None:
    names = sorted(set(PATTERN.findall(FIXTURES.read_text(encoding="utf-8"))))
    OUT.mkdir(parents=True, exist_ok=True)
    total_in = total_out = 0
    for name in names:
        src = SRC / name
        if not src.exists():
            print(f"missing source: {src}")
            continue
        dst = OUT / (Path(name).stem + ".webp")
        im = Image.open(src)
        im = im.convert("RGBA") if im.mode in ("P", "LA", "RGBA") or "transparency" in im.info else im.convert("RGB")
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        im.save(dst, "WEBP", quality=QUALITY, method=6)
        total_in += src.stat().st_size
        total_out += dst.stat().st_size
        print(f"{name:40s} {src.stat().st_size // 1024:6d} KB -> {dst.stat().st_size // 1024:5d} KB  {im.size}")
    print(f"total {total_in // 1024} KB -> {total_out // 1024} KB")


if __name__ == "__main__":
    main()
