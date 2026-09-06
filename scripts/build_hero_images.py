"""
Build the hero slideshow backgrounds from the source artwork in static/images/.

Two of the three sources are social-media flyers with a headline, logo and call
to action burned into them. Dropping those behind the hero puts one headline on
top of another, so each source is first cropped down to the region that is
photograph only, then covered onto the hero's wide aspect ratio.

Run from the project root:  python scripts/build_hero_images.py
"""
from pathlib import Path

from PIL import Image, ImageEnhance, ImageStat

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'static' / 'images'
OUT = SRC / 'hero'

# The hero band is wide and short; anything taller just gets cropped away.
TARGET = (1920, 820)

# (source, output, crop box or None)
#
# Crop boxes are in source pixels and were chosen to sit clear of the burned-in
# text: hero.png carries a white panel across its lower third with the logo
# overlapping the panel's top edge, and hero1.png carries its headline down the
# right-hand third.
SOURCES = [
    ('hero2.jpg', 'one.jpg', None),                    # already clean photography
    ('hero1.png', 'two.jpg', (0, 0, 1040, 396)),       # drop the right-hand headline
    ('hero.png', 'three.jpg', (0, 0, 940, 468)),       # drop the lower text panel
]


# White hero text sits on these at a fixed scrim opacity, so the photographs
# have to arrive at a similar tone. The sources range from a near-black desk
# shot to a brightly lit white desk, and at a single scrim setting the bright
# one loses the headline entirely.
TARGET_LUMA = 92


def normalise(img):
    """Bring the image to a consistent, slightly muted tone for white text."""
    luma = ImageStat.Stat(img.convert('L')).mean[0]
    factor = TARGET_LUMA / luma if luma else 1.0
    # Never brighten much, and never crush a dark photograph to nothing.
    factor = max(0.30, min(factor, 1.05))
    img = ImageEnhance.Brightness(img).enhance(factor)
    # A touch of desaturation keeps the navy field dominant rather than the
    # photograph competing with it.
    return ImageEnhance.Color(img).enhance(0.82)


def cover(img, size):
    """Scale and centre-crop so the image fills `size` without distortion."""
    tw, th = size
    sw, sh = img.size
    scale = max(tw / sw, th / sh)
    nw, nh = round(sw * scale), round(sh * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return img.crop((left, top, left + tw, top + th))


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    for name, out_name, box in SOURCES:
        path = SRC / name
        if not path.exists():
            print(f'skip  {name} (missing)')
            continue

        img = Image.open(path).convert('RGB')
        if box:
            img = img.crop(box)
        before = ImageStat.Stat(img.convert('L')).mean[0]
        img = normalise(img)
        img = cover(img, TARGET)
        after = ImageStat.Stat(img.convert('L')).mean[0]

        dest = OUT / out_name
        img.save(dest, 'JPEG', quality=78, optimize=True, progressive=True)
        print(f'wrote {dest.relative_to(ROOT)}  {img.size[0]}x{img.size[1]}  '
              f'{dest.stat().st_size // 1024} KB  '
              f'luma {before:.0f} -> {after:.0f}')


if __name__ == '__main__':
    main()
