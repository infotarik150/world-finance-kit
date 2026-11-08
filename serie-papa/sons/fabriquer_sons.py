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
