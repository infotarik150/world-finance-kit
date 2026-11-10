# Free test: neck stretching on the still image C (no AI animation), by warping the image frame by frame.
# python3 essai_cou.py  ->  essai_cou.mp4 (5 s, 30 fps)
import os, subprocess
import numpy as np
from PIL import Image

H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
src0 = np.asarray(Image.open('depart_C.png').convert('RGB')).astype(np.float32)
BG = src0[150:190, 1250:1350].reshape(-1, 3).mean(0)       # dark closet wall colour
PAD = 360                                                  # extra dark wall above, so the camera can tilt up
src = np.concatenate([np.broadcast_to(BG, (PAD, src0.shape[1], 3)), src0], 0).copy()
# soften the seam between the added wall and the image
k = np.linspace(0, 1, 60)[:, None, None]; src[PAD:PAD + 60] = src[PAD:PAD + 60] * k + BG * (1 - k)
Hh, W, _ = src.shape
X0, X1, FE = 770, 1150, 40                                 # head columns (with soft edges)
NX0, NX1 = 925, 1065                                       # neck columns
CHIN, COLLAR = 482 + PAD, 528 + PAD                                    # neck rows in the source image
DMAX = 330                                                 # how far the head rises (px)
FPS, DUR = 30, 5.0
ease = lambda u: u * u * (3 - 2 * u)

from PIL import ImageFilter
xs = np.arange(W)
wn = np.clip(np.minimum(xs - NX0, NX1 - xs) / 25 + 0.5, 0, 1)         # neck column weight
# head mask: everything in the head box that is not dark wall, above the chin; dilated and softened
lum = np.abs(src - BG).sum(2)
m = np.zeros((Hh, W), np.float32)
box = (slice(150 + PAD, CHIN), slice(X0, X1))
m[box] = (lum[box] > 40).astype(np.float32)
mi = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(6))
m = np.asarray(mi).astype(np.float32)[..., None] / 255
plate = src * (1 - m) + BG * m                              # background without the head

def frame(d):
    if d <= 0: return src
    out = plate.copy()
    top = CHIN - d
    # neck: source rows CHIN..COLLAR stretched over top..COLLAR, only in the neck columns
    rows = np.arange(top, COLLAR)
    t = (rows - top) / max(COLLAR - top, 1)
    nr = (CHIN + t * (COLLAR - CHIN)).astype(int)
    w = wn[None, :, None]
    out[top:COLLAR] = src[nr] * w + out[top:COLLAR] * (1 - w)
    # head moved up by d, composited with its mask
    hs = src[d:]; ms = m[d:]
    out[:Hh - d] = hs * ms + out[:Hh - d] * (1 - ms)
    return out

os.makedirs('build/cou', exist_ok=True)
n = int(FPS * DUR)
for i in range(n):
    tt = i / FPS
    u = ease(np.clip((tt - 1.0) / 3.2, 0, 1))
    d = int(DMAX * u)
    img = Image.fromarray(np.clip(frame(d), 0, 255).astype(np.uint8))
    # camera tilts up to follow the head (crop window rises), slight push-in
    z = 1.0 + 0.10 * u; cy = PAD + 540 - 330 * u
    cw, ch = W / z, 1080 / z
    y0 = int(np.clip(cy - ch / 2, 0, Hh - ch)); x0 = int((W - cw) / 2)
    img = img.crop((x0, y0, int(x0 + cw), int(y0 + ch))).resize((1920, 1080), Image.LANCZOS)
    img.save(f'build/cou/f_{i:03d}.png')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', 'build/cou/f_%03d.png',
                '-vf', 'eq=saturation=0.88:contrast=1.06,vignette=PI/5,noise=alls=5:allf=t',
                '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', 'essai_cou.mp4'], check=True)
print('ok essai_cou.mp4')
