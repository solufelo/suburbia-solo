"""
Builds the web-sized textures the customiser uses from the full-size PNGs in
public/Images. Re-run after adding a new deck or wheel PNG there:

    python scripts/build-textures.py

Outputs (all WebP):
  public/textures/decks/<id>.webp        1028x2048 deck texture for the 3D model
  public/textures/decks/<id>-thumb.webp  deck graphic cut to the board shape (swatch)
  public/textures/wheels/<id>.webp       512x512 wheel texture / swatch

The source PNGs are 2056x4096 and ~4 MB each; the WebP textures are ~5-10x
smaller, which is what makes switching decks in the customiser feel instant.
"""

from pathlib import Path
import warnings

from PIL import Image, ImageDraw, ImageFilter

warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "Images"
OUT_DECKS = ROOT / "public" / "textures" / "decks"
OUT_WHEELS = ROOT / "public" / "textures" / "wheels"

# id -> source file. Keep ids in sync with src/lib/customizer-options.ts
DECKS = {
    "oni-mask": "OniMask.png",
    "pink-swirl": "PinkSwirl.png",
    "red-black": "red-and-black.png",
    "green-navy": "green-and-navy.png",
    "black-yellow": "black-and-yellow.png",
    "yellow-black": "yellow-and-black.png",
    "gray-black": "gray-and-black.png",
    "red-white": "red-and-white.png",
    "grid-streaks": "grid-streaks.png",
    "thank-you": "thank-you-deck.png",
    "against-the-tide": "against-the-tide.png",
}

WHEELS = ["cream", "black", "red", "pink", "purple", "blue", "navy", "green", "yellow"]


def deck_mask(size):
    """Board outline in texture space: the art sits in the left half of the
    UV layout (x 14..1043, y 40..4056 at 2056x4096) as a long pill."""
    w, h = size
    sx, sy = w / 2056, h / 4096
    left, right = 24 * sx, 1033 * sx
    top, bottom = 50 * sy, 4046 * sy
    radius = (right - left) / 2
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [left, top, right, bottom], radius=radius * 1.15, fill=255
    )
    box = (int(left), int(top), int(right) + 1, int(bottom) + 1)
    return mask.filter(ImageFilter.GaussianBlur(1)), box


def main():
    OUT_DECKS.mkdir(parents=True, exist_ok=True)
    OUT_WHEELS.mkdir(parents=True, exist_ok=True)

    for deck_id, filename in DECKS.items():
        img = Image.open(SRC / filename).convert("RGB")
        tex = img.resize((1028, 2048), Image.LANCZOS)
        tex.save(OUT_DECKS / f"{deck_id}.webp", "WEBP", quality=84, method=6)

        thumb_src = img.resize((514, 1024), Image.LANCZOS).convert("RGBA")
        mask, box = deck_mask(thumb_src.size)
        thumb_src.putalpha(mask)
        thumb = thumb_src.crop(box)
        thumb = thumb.resize((160, int(160 * thumb.height / thumb.width)), Image.LANCZOS)
        thumb.save(OUT_DECKS / f"{deck_id}-thumb.webp", "WEBP", quality=88, method=6)
        print("deck", deck_id)

    for wheel in WHEELS:
        img = Image.open(SRC / f"wheel-{wheel}.png").convert("RGBA")
        img.resize((512, 512), Image.LANCZOS).save(
            OUT_WHEELS / f"{wheel}.webp", "WEBP", quality=86, method=6
        )
        print("wheel", wheel)


if __name__ == "__main__":
    main()
