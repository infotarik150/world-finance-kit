# Episode 1, version 2 (patch of the final video, the original montage script was not saved):
#  - 4.6-12.2 s: kitchen (humming) then new image of Mom at work, night nurse at the hospital (subtitles at the bottom there)
#  - Mom humming her song from the kitchen, from the start until "The humming stops" (43.4 s)
#  - Luna calls "Mom? What's our password?" loudly down the stairs, fake Mom answers "Blueberry!" loudly
# Usage: python3 patch_v2.py   (needs build/patch overlay frames: node rendre_patch.js build/patch 4.6 12.2)
import os, subprocess, wave
import numpy as np

H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
SRC = 'v03_maman_au_telephone.mp4'; OUT = 'v03_maman_au_telephone_v2.mp4'; B = 'build'
FF = ['ffmpeg', '-v', 'error', '-y']
run = lambda *a: subprocess.run(list(a), check=True)
SR = 48000; D = 76.5

def rd(p, sr=SR):
    tmp = f'{B}/_r.wav'; run(*FF, '-i', p, '-ac', '1', '-ar', str(sr), tmp)
    w = wave.open(tmp); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

def fades(x, a=0.03, b=0.03):
    n = len(x); e = np.ones(n, np.float32)
    na, nb = int(a * SR), int(b * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nb: e[n - nb:] = np.linspace(1, 0, nb)
    return x * e

def audio():
    mix = rd('audio/mix.wav'); mix = mix[:int(D * SR)]
    drone = rd('../../sons/drone.wav')
    def replace(t0, t1):
        """Remove the old voice in [t0, t1]: keep only a drone bed at the level of the gap just before."""
        i0, i1 = int(t0 * SR), int(t1 * SR)
        ref = mix[i0 - int(0.3 * SR):i0]; lvl = np.sqrt((ref ** 2).mean())
        bed = drone[i0 % len(drone):][:i1 - i0]
        if len(bed) < i1 - i0: bed = np.concatenate([bed, drone[:i1 - i0 - len(bed)]])
        bed = bed / (np.sqrt((bed ** 2).mean()) + 1e-9) * lvl
        xf = int(0.06 * SR); k = np.linspace(0, 1, xf)
        seg = bed.copy()
        seg[:xf] = mix[i0:i0 + xf] * (1 - k) + bed[:xf] * k
        seg[-xf:] = bed[-xf:] * (1 - k) + mix[i1 - xf:i1] * k
        mix[i0:i1] = seg
    def put(x, t, g):
        i = int(t * SR); mix[i:i + len(x)] += g * x[:len(mix) - i]
    replace(40.15, 42.85); replace(44.95, 46.0)
    luna = rd('audio/v2/luna_password_fort.mp3'); bb = rd('audio/v2/sophie_blueberry_fort.mp3')
    vref = np.abs(mix[int(36.7 * SR):int(39.7 * SR)]).max()          # narration peak level nearby
    gl = 0.95 * vref / np.abs(luna).max(); gb = 0.95 * vref / np.abs(bb).max()
    put(fades(luna[:int(0.9 * SR)]), 40.2, gl)                          # "Mom?"
    p2 = luna[int(1.35 * SR):int(3.0 * SR)]                             # quieter in the take: own gain
    put(fades(p2), 41.1, 0.9 * vref / np.abs(p2).max())                 # "What's our password?"
    put(fades(bb[:int(1.2 * SR)]), 45.0, gb)                            # "Blueberry!"
    # humming from the kitchen: loop, softened (low-pass + small room), stops dead at 43.35 s
    hum = rd('audio/v2/sophie_fredonne.mp3'); hum = hum[int(0.2 * SR):int(16.4 * SR)]
    xf = int(0.8 * SR); k = np.linspace(0, 1, xf); loop = hum.copy()
    while len(loop) < 44 * SR:
        loop = np.concatenate([loop[:-xf], loop[-xf:] * (1 - k) + hum[:xf] * k, hum[xf:]])
    t1 = 43.35; loop = loop[:int(t1 * SR)]
    tmp_in, tmp_out = f'{B}/_h.wav', f'{B}/_h2.wav'
    w = wave.open(tmp_in, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(loop, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
    run(*FF, '-i', tmp_in, '-af', 'lowpass=f=2800,highpass=f=180,aecho=0.8:0.6:40|70:0.25|0.15', tmp_out)
    w = wave.open(tmp_out); hum2 = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    hum2 = fades(hum2[:int(t1 * SR)], 1.0, 0.02)
    gh = 0.16 * vref / (np.abs(hum2).max() + 1e-9)                      # well below the voices
    put(hum2, 0.0, gh)
    x = (np.clip(mix / max(1.0, np.abs(mix).max() / 0.95), -1, 1) * 32767).astype(np.int16)
    w = wave.open(f'{B}/mix_v2_brut.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes()); w.close()
    run(*FF, '-i', f'{B}/mix_v2_brut.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89', '-ar', str(SR), '-ac', '2', 'audio/mix_v2.wav')

def video():
    # 4.6-8.8 s: back in the kitchen ("It sounds like Mom humming her song"), slow zoom on the still image
    # 8.8-12.2 s: Mom at work at the hospital ("But Mom works nights. She's never home before sunrise.")
    t0, tm, t1 = 4.6, 8.8, 12.2
    n1, n2 = round((tm - t0) * 30), round((t1 - tm) * 30)
    grade = "eq=saturation=0.88:contrast=1.06,vignette=PI/5,noise=alls=5:allf=t"
    zp = lambda n, z0, z1, cx, cy: (f"scale=3840:2160,zoompan=z='({z0}+({z1}-{z0})*on/{n - 1})'"
                                    f":x='max(0,min(iw-iw/zoom,{2 * cx}-iw/zoom/2))':y='max(0,min(ih-ih/zoom,{2 * cy}-ih/zoom/2))'"
                                    f":d={n}:s=1920x1080:fps=30,trim=end_frame={n},setpts=PTS-STARTPTS,setsar=1,{grade}")
    fc = (f"[1:v]{zp(n1, 1.12, 1.28, 960, 470)}[k];[2:v]{zp(n2, 1.0, 1.06, 960, 540)}[h];[k][h]concat=n=2:v=1:a=0[s];"
          f"[s][3:v]overlay=0:0:format=auto[new];"
          f"[0:v]trim=0:{t0},setpts=PTS-STARTPTS[a];[0:v]trim={t1}:{D},setpts=PTS-STARTPTS[c];"
          f"[a][new][c]concat=n=3:v=1:a=0[v]")
    run(*FF, '-i', SRC, '-loop', '1', '-i', 'depart_contreplongee.png', '-loop', '1', '-i', 'depart_hopital.png',
        '-framerate', '30', '-i', f'{B}/patch/o_%04d.png', '-i', 'audio/mix_v2.wav',
        '-filter_complex', fc, '-map', '[v]', '-map', '4:a', '-t', str(D),
        '-c:v', 'libx264', '-preset', 'medium', '-b:v', '8M', '-maxrate', '10M', '-bufsize', '20M', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', OUT)

if __name__ == '__main__':
    import sys; os.makedirs(B, exist_ok=True)
    if 'video' not in sys.argv[1:]: audio()
    video(); print('ok', OUT)
