# Free sound effects synthesised from scratch (no licence issue): whoosh, pop, footstep, cartoon woof, sigh-free.
import numpy as np, wave, os
SR = 44100
out = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)
def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    with wave.open(os.path.join(out, name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def lp(x, a):  # one-pole low-pass, a in 0..1 (array or scalar)
    y = np.zeros_like(x); s = 0.0; a = np.broadcast_to(a, x.shape)
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y
t = lambda d: np.arange(int(SR * d)) / SR
# whoosh: band-passed noise sweeping up then down
d = 0.45; tt = t(d); n = rng.standard_normal(len(tt))
sweep = 0.02 + 0.25 * np.sin(np.pi * tt / d) ** 2
w = lp(n, sweep) - lp(n, sweep * 0.25)
save('whoosh.wav', w * np.sin(np.pi * tt / d) ** 1.5)
# pop: short pitch-dropping sine blip
d = 0.12; tt = t(d); f = 900 * np.exp(-tt * 18) + 300
save('pop.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 35))
# footstep: soft low thump + tiny scuff
d = 0.12; tt = t(d)
thump = np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 45)
scuff = lp(rng.standard_normal(len(tt)), 0.3) * np.exp(-tt * 60) * 0.25
save('pas.wav', thump + scuff)
# cartoon woof: voiced burst with falling pitch and two formants, noisy attack
d = 0.22; tt = t(d)
f0 = 520 * np.exp(-tt * 4) + 160
ph = 2 * np.pi * np.cumsum(f0) / SR
src = sum(np.sin(k * ph) / k for k in range(1, 12)) + 0.35 * rng.standard_normal(len(tt))
env = np.minimum(tt / 0.008, 1) * np.exp(-tt * 9)
def reson(x, fc, bw):
    r = np.exp(-np.pi * bw / SR); c = 2 * r * np.cos(2 * np.pi * fc / SR); y = np.zeros_like(x)
    for i in range(2, len(x)): y[i] = x[i] + c * y[i-1] - r * r * y[i-2]
    return y
woof = reson(src, 700, 250) + 0.6 * reson(src, 1500, 300)
save('wouf.wav', woof * env)
print('ok', sorted(os.listdir(out)))

# --- added for video 02 ---
# low cinematic impact: sub boom + filtered noise burst
d = 1.6; tt = t(d)
boom = np.sin(2 * np.pi * (45 + 25 * np.exp(-tt * 6)) * tt) * np.exp(-tt * 2.2)
nz = lp(rng.standard_normal(len(tt)), 0.05) * np.exp(-tt * 5) * 2
save('impact.wav', boom + nz)
# phone notification: two soft sine dings
d = 0.5; tt = t(d)
ding = lambda f, s: np.sin(2 * np.pi * f * (tt - s)) * np.exp(-np.clip(tt - s, 0, None) * 9) * (tt >= s)
save('notification.wav', ding(1320, 0) + 0.8 * ding(1760, 0.12))
# chair scrape on the floor: rough noise with a wobbling band
d = 0.55; tt = t(d); n = rng.standard_normal(len(tt))
a = 0.08 + 0.05 * np.sin(2 * np.pi * 23 * tt)
sc = (lp(n, a) - lp(n, a * 0.3)) * (1 + 0.6 * np.sin(2 * np.pi * 57 * tt))
save('chaise.wav', sc * np.sin(np.pi * tt / d) ** 0.7)
# electronic scan: rising sine sweep with tremolo
d = 1.0; tt = t(d); f = 600 + 1400 * tt / d
save('scan.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * tt)) * np.sin(np.pi * tt / d))
# cartoon boing impact
d = 0.6; tt = t(d); f = 180 + 120 * np.sin(2 * np.pi * 9 * tt) * np.exp(-tt * 4)
thud = np.sin(2 * np.pi * 60 * tt) * np.exp(-tt * 30)
save('boing.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5) + thud)
print('ok v02', sorted(os.listdir(out)))

# --- added for video 03 ---
# phone vibration: two short low buzz bursts
d = 0.9; tt = t(d)
env = ((tt < 0.32) | ((tt > 0.48) & (tt < 0.8))).astype(float)
env = lp(env, 0.01)
buzz = np.sign(np.sin(2 * np.pi * 165 * tt)) * 0.5 + np.sin(2 * np.pi * 82 * tt)
save('vibration.wav', lp(buzz, 0.25) * env)
# frying pan sizzle: crackly high noise with random pops, 4 s loopable
d = 4.0; tt = t(d); n = rng.standard_normal(len(tt))
hiss = n - lp(n, 0.35)
pops = (rng.random(len(tt)) > 0.9993).astype(float)
pops = np.convolve(pops, np.exp(-np.arange(300) / 40.0), mode='same') * rng.standard_normal(len(tt))
amp = 0.6 + 0.4 * lp(np.abs(rng.standard_normal(len(tt))), 0.0005) * 3
save('poele.wav', (0.35 * hiss + 0.8 * pops) * np.clip(amp, 0, 1.2))
print('ok v03')

# --- added for video 03 (scary version) ---
# dark drone: detuned low sines + filtered noise, slow swell, 20 s loopable
d = 20.0; tt = t(d)
dr = sum(np.sin(2 * np.pi * f * tt + p) for f, p in ((41.2, 0), (41.9, 1.0), (61.7, 2.0), (82.4, 0.5)))
dr += 0.6 * lp(rng.standard_normal(len(tt)), 0.004)
dr *= 0.75 + 0.25 * np.sin(2 * np.pi * tt / d)
save('drone.wav', dr)
# heartbeat: lub-dub thumps, one beat (~0.9 s)
d = 0.9; tt = t(d)
thump = lambda s0, f, g: g * np.sin(2 * np.pi * f * np.clip(tt - s0, 0, None)) * np.exp(-np.clip(tt - s0, 0, None) * 28) * (tt >= s0)
save('coeur.wav', thump(0, 55, 1.0) + thump(0.18, 48, 0.7))
print('ok scary')
