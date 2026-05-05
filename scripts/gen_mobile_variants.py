import sys, io, os, glob
from PIL import Image
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

configs = [
    {"dir": "C:/elos_website/assets/screenshots/desktop", "max_w": 720},
    {"dir": "C:/elos_website/assets/screenshots/mobile",  "max_w": 540},
]

total_before, total_after = 0, 0
for cfg in configs:
    print("=== " + os.path.basename(cfg["dir"]) + " (max " + str(cfg["max_w"]) + "px) ===")
    for png in sorted(glob.glob(os.path.join(cfg["dir"], "*.png"))):
        img = Image.open(png)
        w, h = img.size
        if w <= cfg["max_w"]:
            continue
        ratio = cfg["max_w"] / w
        new_size = (cfg["max_w"], int(h * ratio))
        resized = img.resize(new_size, Image.LANCZOS)
        out_path = png.replace(".png", "-m.webp")
        resized.save(out_path, "WEBP", quality=78, method=6)
        sa = os.path.getsize(out_path)
        full = png.replace(".png", ".webp")
        sb = os.path.getsize(full) if os.path.exists(full) else 0
        total_before += sb
        total_after += sa
        red = (1 - sa/sb)*100 if sb else 0
        print("  " + os.path.basename(png) + ": " + str(w) + "x" + str(h) + " -> " + str(new_size[0]) + "x" + str(new_size[1]) + "  |  " + str(sb//1024) + "KB -> " + str(sa//1024) + "KB  (" + str(int(red)) + "% smaller)")

print("\nMobile variants total: " + str(total_after//1024) + "KB (vs " + str(total_before//1024) + "KB full WebP)")
