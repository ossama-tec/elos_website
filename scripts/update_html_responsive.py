import sys, io, os, re
from PIL import Image
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

with open("C:/elos_website/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Pattern: <picture><source srcset="X.webp" type="image/webp"><img ...src="X.png"...></picture>
pattern = re.compile(
    r'<picture><source srcset="(?P<webp>assets/screenshots/(?P<dir>mobile|desktop)/(?P<base>[^"]+))\.webp" type="image/webp">'
    r'(?P<img><img[^>]*src="(?P=webp)\.png"[^>]*>)'
    r'</picture>'
)

def transform(m):
    base = m.group("webp")  # e.g. "assets/screenshots/desktop/desktop-pos"
    img_tag = m.group("img")
    base_dir = m.group("dir")

    png_path = "C:/elos_website/" + base + ".png"
    if not os.path.exists(png_path):
        return m.group(0)
    w, h = Image.open(png_path).size

    # Skip if already has width attribute
    if 'width=' in img_tag:
        new_img = img_tag
    else:
        # Insert width/height after `<img`
        new_img = re.sub(r'<img\s', f'<img width="{w}" height="{h}" ', img_tag, count=1)

    return (
        '<picture>'
        f'<source media="(max-width: 768px)" srcset="{base}-m.webp" type="image/webp">'
        f'<source srcset="{base}.webp" type="image/webp">'
        f'{new_img}'
        '</picture>'
    )

new_html, count = pattern.subn(transform, html)
print(f"Updated {count} <picture> blocks with responsive sources + width/height")

with open("C:/elos_website/index.html", "w", encoding="utf-8") as f:
    f.write(new_html)
