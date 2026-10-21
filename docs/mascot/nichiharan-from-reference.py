"""
にちはらんのサイト用画像を、新田さん提供の原画(docs/mascot/nichiharan/reference-v2.webp)から切り出す。
絵の形は変えず、帽子のスリットの中に金の星と星粒を描き足すだけにする。

  python3 docs/mascot/nichiharan-from-reference.py <出力フォルダ>
  → wave.png telescope.png cheer.png hareru.png(背景は原画と同じ生成り色)
  hareru.png は wave を少し小さくして、口ぐせ「今日は晴れるかなぁ」のふきだしを添えたもの。
  ふきだしの文字は IPAゴシック(fonts-ipafont-gothic)で描く
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

SRC = Path(__file__).parent / 'nichiharan' / 'reference-v2.webp'
GOLD = (210, 170, 88)
WHITE = (255, 255, 255)
BG = (253, 252, 245)
SS = 4  # なめらかに描くための拡大率

# 原画の中の位置(px)。box は切り出す範囲、stars は (x, y, 半径)、dots は白い星粒 (x, y, 半径)
FIGURES = {
    'wave': {
        'box': (128, 206, 806, 915),
        'stars': [(555, 274, 19), (573, 342, 12)],
        'dots': [(583, 246, 2.6), (543, 308, 3), (592, 314, 2.2), (556, 368, 2.8), (598, 372, 2)],
    },
    'telescope': {
        'box': (970, 40, 1455, 490),
        'stars': [(1157, 96, 11), (1180, 129, 7)],
        'dots': [(1145, 76, 1.8), (1170, 112, 2), (1188, 104, 1.5), (1162, 140, 1.6)],
    },
    'cheer': {
        'box': (928, 505, 1436, 965),
        'stars': [(1214, 556, 12), (1221, 592, 8)],
        'dots': [(1206, 538, 1.6), (1232, 572, 2), (1201, 600, 2), (1234, 604, 1.5)],
    },
}


def star_points(cx, cy, r, inner=0.45):
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * inner
        a = -math.pi / 2 + i * math.pi / 5
        pts.append(((cx + rr * math.cos(a)) * SS, (cy + rr * math.sin(a)) * SS))
    return pts


def build(name, spec):
    src = Image.open(SRC).convert('RGB')
    x0, y0, x1, y1 = spec['box']
    # 星は原画座標で描くので、先に原画全体へ重ねてから切り出す
    layer = Image.new('RGBA', (src.width * SS, src.height * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for cx, cy, r in spec['stars']:
        d.polygon(star_points(cx, cy, r), fill=GOLD + (255,))
    for cx, cy, r in spec['dots']:
        d.ellipse(((cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS), fill=WHITE + (255,))
    layer = layer.resize(src.size, Image.LANCZOS)
    out = Image.alpha_composite(src.convert('RGBA'), layer).convert('RGB').crop((x0, y0, x1, y1))
    # サイトの枠(300:320)に合わせて上下左右に余白を足す
    w, h = out.size
    target_h = max(h, round(w * 320 / 300))
    target_w = max(w, round(target_h * 300 / 320))
    canvas = Image.new('RGB', (target_w, target_h), BG)
    canvas.paste(out, ((target_w - w) // 2, (target_h - h) // 2))
    return canvas.resize((600, 640), Image.LANCZOS)


FONT = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
NAVY = (27, 43, 85)


def with_bubble(base):
    from PIL import ImageFont

    W, H = base.size
    canvas = Image.new('RGB', (W, H), BG)
    small = base.resize((round(W * 0.8), round(H * 0.8)), Image.LANCZOS)
    canvas.paste(small, (W - small.width, H - small.height))
    big = canvas.resize((W * SS, H * SS), Image.LANCZOS)
    d = ImageDraw.Draw(big)
    x0, y0, x1, y1 = 14, 14, 250, 118
    d.rounded_rectangle((x0 * SS, y0 * SS, x1 * SS, y1 * SS), radius=26 * SS, fill=WHITE, outline=NAVY, width=5 * SS)
    tail = [(150 * SS, 112 * SS), (196 * SS, 112 * SS), (214 * SS, 160 * SS)]
    d.polygon(tail, fill=WHITE)
    d.line([tail[0], tail[2], tail[1]], fill=NAVY, width=5 * SS, joint='curve')
    font = ImageFont.truetype(FONT, 30 * SS)
    for i, line in enumerate(['今日は', '晴れるかなぁ']):
        tw = d.textlength(line, font=font)
        d.text((((x0 + x1) / 2) * SS - tw / 2, (30 + i * 40) * SS), line, font=font, fill=NAVY)
    return big.resize((W, H), Image.LANCZOS)


if __name__ == '__main__':
    dest = Path(sys.argv[1])
    dest.mkdir(parents=True, exist_ok=True)
    for name, spec in FIGURES.items():
        build(name, spec).save(dest / f'{name}.png', optimize=True)
        print('wrote', dest / f'{name}.png')
    with_bubble(build('wave', FIGURES['wave'])).save(dest / 'hareru.png', optimize=True)
    print('wrote', dest / 'hareru.png')
