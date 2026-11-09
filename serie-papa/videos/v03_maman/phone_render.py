# Composites animated text messages onto the phone screen of the POV shot (plans/p5_pov.mp4).
# The screen is tracked per frame (pov/screen.json); fingers stay on top because the content
# is only painted where the original pixel belongs to the screen.
# Usage: python3 phone_render.py SEGMENT_NAME out_dir   (segments defined in SEGS below)
import sys, os, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
FONTB = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
TR = json.load(open(os.path.join(HERE, 'pov/screen.json')))
KEYS = sorted(int(k) for k in TR)

Q0 = np.array([(635, 435), (825, 450), (740, 847), (522, 812)], float)  # screen TL, TR, BR, BL in frame 1
def _sm(k, f):
    win = [TR[str(j)][f] for j in range(k - 4, k + 5) if str(j) in TR]
    return sum(win) / len(win)
R0 = {f: _sm(1, f) for f in ('cx', 'cy', 'ang', 'area')}
def quad(k):
    k = min(max(k, KEYS[0]), KEYS[-1])
    da = math.radians(_sm(k, 'ang') - R0['ang']); sc = math.sqrt(_sm(k, 'area') / R0['area'])
    sc = 1 + 0.6 * (sc - 1)
    c, s_ = math.cos(da) * sc, math.sin(da) * sc
    P = Q0 - (R0['cx'], R0['cy'])
    P = np.stack([P[:, 0] * c - P[:, 1] * s_, P[:, 0] * s_ + P[:, 1] * c], 1)
    return P + (_sm(k, 'cx'), _sm(k, 'cy'))
def persp_coeffs(src, dst):
    # coefficients mapping output (dst) points -> input (src) points, for Image.transform PERSPECTIVE
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; B += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(B, float))
MW = float(np.median([TR[k]['w'] for k in TR])); MH = float(np.median([TR[k]['h'] for k in TR]))
def track(k):
    k = min(max(k, KEYS[0]), KEYS[-1])
    win = [TR[str(j)] for j in range(k - 4, k + 5) if str(j) in TR]
    T = {f: sum(w[f] for w in win) / len(win) for f in ('cx', 'cy', 'ang')}
    T['w'], T['h'] = MW * 0.97, MH * 0.97
    return T

OLD = [('omw home luv u', 'in', [(0, 3), (9, 12)]), ('dont forgt ur lunch', 'in', [(0, 4), (5, 10)]),
       ('ok mom', 'out', []), ('proud of u kidddo', 'in', [(11, 17)])]

def screen_content(W, H, msgs, typing=False, typo_hl=0.0, perfect_hl=0.0, photo=None, light=1.0):
    """Portrait screen image W x H (RGBA). msgs: list of (text, side, typo_spans) or ('PHOTO',..)."""
    s = W / 430.0
    final = Image.new('RGB', (W, H), (14, 18, 34))
    im = Image.new('RGB', (W, H * 4), (14, 18, 34))
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, max(8, int(24 * s)))
    fb = ImageFont.truetype(FONTB, max(8, int(22 * s)))
    fs = ImageFont.truetype(FONT, max(7, int(16 * s)))
    r = int(26 * s); cx = W // 2
    y = int(20 * s); pad = int(14 * s); maxw = int(W * 0.74)
    def wrap(t, font):
        words, lines, cur = t.split(' '), [], ''
        for w in words:
            tst = (cur + ' ' + w).strip()
            if d.textlength(tst, font=font) <= maxw - 2 * pad: cur = tst
            else: lines.append(cur); cur = w
        lines.append(cur); return lines
    for item in msgs:
        if item[0] == 'DAY':
            d.text((cx, y + int(10 * s)), item[1], font=fs, fill=(140, 147, 176), anchor='mm'); y += int(34 * s); continue
        if item[0] == 'PHOTO':
            pw, ph = int(W * 0.62), int(W * 0.8)
            x0 = int(18 * s)
            d.rounded_rectangle([x0, y, x0 + pw, y + ph], radius=int(16 * s), fill=(20, 28, 52), outline='white', width=max(1, int(3 * s)))
            if photo is not None:
                p = photo.resize((pw - 8, ph - 8)); im.paste(p, (x0 + 4, y + 4), p if p.mode == 'RGBA' else None)
            y += ph + int(14 * s); continue
        text, side, spans = item
        lines = wrap(text, f); lh = int(30 * s)
        bw = max(d.textlength(l, font=f) for l in lines) + 2 * pad; bh = lh * len(lines) + 2 * pad - int(6 * s)
        x0 = int(18 * s) if side == 'in' else W - int(18 * s) - bw
        col = (44, 51, 84) if side == 'in' else (59, 130, 246)
        d.rounded_rectangle([x0, y, x0 + bw, y + bh], radius=int(20 * s), fill=col)
        if item is msgs[-1] and perfect_hl > 0 and side == 'in':
            d.rounded_rectangle([x0 - 5 * s, y - 5 * s, x0 + bw + 5 * s, y + bh + 5 * s], radius=int(24 * s),
                                outline=(255, 212, 59), width=max(2, int(5 * s * perfect_hl)))
        for i, l in enumerate(lines):
            ty = y + pad + i * lh
            d.text((x0 + pad, ty), l, font=f, fill='white')
            if typo_hl > 0:
                for a, b in spans:
                    xa = x0 + pad + d.textlength(l[:a], font=f); xb = x0 + pad + d.textlength(l[:b], font=f)
                    yy = ty + int(29 * s)
                    pts = [(xa + j * 5 * s, yy + (2.5 * s if j % 2 else -1 * s)) for j in range(int((xb - xa) / (5 * s)) + 1)]
                    if len(pts) > 1: d.line(pts, fill=(255, 80, 80), width=max(1, int(3 * s * typo_hl)))
        y += bh + int(12 * s)
    if typing:
        x0 = int(18 * s); d.rounded_rectangle([x0, y, x0 + int(90 * s), y + int(48 * s)], radius=int(22 * s), fill=(44, 51, 84))
        for j in range(3):
            d.ellipse([x0 + int((22 + j * 22) * s) - 6 * s, y + int(24 * s) - 6 * s, x0 + int((22 + j * 22) * s) + 6 * s, y + int(24 * s) + 6 * s],
                      fill=(170 + 60 * (j == typing % 3),) * 3)
    y += int(24 * s)
    hh = int(118 * s); avail = H - hh
    part = im.crop((0, max(0, y - avail), W, max(y, avail)))
    final.paste(part, (0, hh + max(0, avail - y)) if y < avail else (0, hh))
    d2 = ImageDraw.Draw(final)
    d2.rectangle([0, 0, W, hh], fill=(20, 25, 44))
    d2.ellipse([cx - r, int(22 * s), cx + r, int(22 * s) + 2 * r], fill=(201, 79, 124))
    d2.text((cx, int(22 * s) + r), 'M', font=fb, fill='white', anchor='mm')
    d2.text((cx, int(98 * s)), 'Mom', font=fb, fill='white', anchor='mm')
    if light < 1: final = Image.blend(Image.new('RGB', (W, H), (8, 9, 14)), final, light)
    return final

def frame(k, t, state, zoom=1.0, center=None):
    src = Image.open(os.path.join(HERE, f'pov/f_{k:03d}.png')).convert('RGB')
    a = np.asarray(src).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (r > 30) & (r < 80) & (g > 28) & (g < 78) & (b > 36) & (b < 88) & (np.abs(r - g) < 10) & (b - r > 0) & (b - r < 16)
    m[:, :350] = False; m[:, 1000:] = False; m[:300] = False; m[950:] = False
    T = track(k)
    if center is None: center = (T['cx'], T['cy'])
    # crop window
    cw, ch = 1920 / zoom, 1080 / zoom
    x0 = min(max(center[0] - cw / 2, 0), 1920 - cw); y0 = min(max(center[1] - ch / 2, 0), 1080 - ch)
    box = (x0, y0, x0 + cw, y0 + ch)
    base = src.crop(tuple(int(v) for v in box)).resize((1920, 1080), Image.LANCZOS)
    Q = quad(k)
    Qc = (Q - (x0, y0)) * zoom
    poly = Image.new('L', (1920, 1080), 0); ImageDraw.Draw(poly).polygon([tuple(p) for p in Qc], fill=255)
    skin = (r - b > 45) & (r > 110) & (r > g)
    skin = nd.binary_dilation(nd.binary_opening(skin, iterations=1), iterations=2)
    skinz = Image.fromarray((skin * 255).astype('uint8')).crop(tuple(int(v) for v in box)).resize((1920, 1080), Image.BILINEAR)
    mask = Image.fromarray(((np.asarray(poly) > 0) & (np.asarray(skinz) < 128)).astype('uint8') * 255).filter(ImageFilter.GaussianBlur(1.2))
    if state is None: return base
    sw = int(np.hypot(*(Qc[1] - Qc[0])) * 1.0); sh = int(np.hypot(*(Qc[3] - Qc[0])))
    sw = max(sw, int(np.hypot(*(Qc[2] - Qc[3])))); sh = max(sh, int(np.hypot(*(Qc[2] - Qc[1]))))
    content = screen_content(sw, sh, **state).filter(ImageFilter.GaussianBlur(0.5 * zoom / 2))
    co = persp_coeffs([(0, 0), (sw, 0), (sw, sh), (0, sh)], [tuple(p) for p in Qc])
    warped = content.transform((1920, 1080), Image.PERSPECTIVE, tuple(co), resample=Image.BICUBIC)
    # keep the screen's own lighting: blend a little of the original glass on top
    warped = Image.blend(warped, base, 0.12)
    out = base.copy(); out.paste(warped, (0, 0), mask)
    return out

PHOTO = None
def photo_img():
    global PHOTO
    if PHOTO is None:
        p = Image.new('RGBA', (300, 390), (20, 28, 52, 255)); d = ImageDraw.Draw(p)
        d.line([(0, 320), (170, 320)], fill='white', width=3)
        d.line([(170, 320), (190, 320), (190, 340), (210, 340), (210, 360), (230, 360), (230, 380), (250, 380)], fill='white', width=3)
        d.line([(165, 260), (300, 370)], fill='white', width=3)
        L = Image.open(os.path.join(HERE, 'cut/luna_dos.png')).convert('RGBA'); L = L.resize((int(L.width * 240 / L.height), 240))
        p.paste(L, (80, 82), L); PHOTO = p
    return PHOTO

HIST = [('DAY', 'Yesterday')] + OLD + [('DAY', 'Today 3:07 AM')]
HIDE = ("I'm at work. Someone is in the house. Hide.", 'in', [])
DONT = ("Don't go down those stairs.", 'in', [])

def state_at(seg, t):
    if seg == 'hide':          # 6.0 s: typing then message
        if t < 0.6: return dict(msgs=HIST[:-1], light=max(0.05, min(1, t / 0.6)))
        if t < 2.4: return dict(msgs=HIST, typing=int(t * 6))
        return dict(msgs=HIST + [HIDE])
    if seg == 'typos':         # 7.0 s: typos underline, then perfect message outline
        return dict(msgs=HIST + [HIDE], typo_hl=min(1, max(0, (t - 0.8) / 0.6)), perfect_hl=min(1, max(0, (t - 3.6) / 0.5)))
    if seg == 'dont':          # 5.4 s
        base = [('DAY', 'Today 3:07 AM'), HIDE, ('DAY', '3:09 AM')]
        if t < 1.0: return dict(msgs=base, typing=int(t * 6))
        return dict(msgs=base + [DONT])
    if seg == 'photo':         # 6.2 s
        base = [HIDE, ('DAY', '3:09 AM'), DONT, ('DAY', '3:10 AM')]
        if t < 0.8: return dict(msgs=base, typing=int(t * 6))
        return dict(msgs=base + [('PHOTO',)], photo=photo_img())
    if seg == 'final':
        return dict(msgs=[HIDE, ('DAY', '3:09 AM'), DONT, ('DAY', '3:10 AM'), ('PHOTO',)], photo=photo_img())
    return None

SEGS = {  # name: (duration, first_frame, last_frame, zoom_start, zoom_end, state)
    'hide': (6.0, 1, 151, 1.9, 2.2),
    'typos': (7.0, 60, 100, 1.9, 2.1),
    'dont': (5.4, 1, 151, 1.9, 2.15),
    'photo': (6.2, 100, 151, 1.9, 2.2),
    'final': (6.5, 151, 151, 1.0, 1.0),
}
if __name__ == '__main__':
    seg, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
    dur, f0, f1, z0, z1 = SEGS[seg]; n = round(dur * 30)
    TC = track(76)
    for i in range(n):
        t = i / 30; u = i / max(1, n - 1)
        k = int(round(f0 + (f1 - f0) * u))
        z = z0 + (z1 - z0) * (u * u * (3 - 2 * u))
        center = (TC['cx'] + 330, TC['cy'] - 40) if z > 1 else None
        frame(k, t, None if os.environ.get('RAW') else state_at(seg, t), z, center).save(os.path.join(out, f'{i:04d}.png'))
    print(seg, n)
