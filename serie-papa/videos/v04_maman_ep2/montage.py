# Episode 2 montage: python3 montage.py [video|audio|overlay|final|all]
# Reads timeline.json (run timeline.py first). Work files go to build/ (ignored by git).
import json, os, subprocess, sys, wave
import numpy as np

H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
TL = json.load(open('timeline.json')); B = 'build'; os.makedirs(B, exist_ok=True)
FPS = 30
run = lambda *a: subprocess.run(list(a), check=True)
FF = ['ffmpeg', '-v', 'error', '-y']
ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', '-an']

def still_src(img):
    if img.startswith('last:'):   # last frame of a clip
        clip = img[5:]; out = f'{B}/last_{os.path.basename(clip)}.png'
        run(*FF, '-sseof', '-0.1', '-i', clip, '-frames:v', '1', '-vf', 'scale=1920:1080', out)
        return out
    if img.startswith('at:'):     # one frame of a clip at a given time
        _, clip, t = img.split(':'); out = f'{B}/at_{os.path.basename(clip)}_{t}.png'
        run(*FF, '-ss', t, '-i', clip, '-frames:v', '1', '-vf', 'scale=1920:1080', out)
        return out
    return img

def video():
    parts = []
    for i, s in enumerate(TL['segments']):
        out = f'{B}/seg_{i:02d}.mp4'; parts.append(out)
        if s[0] == 'clip':
            _, src, a, b, sp = s; dur = (b - a) / sp
            vf = f'trim=start={a}:end={b},setpts=(PTS-STARTPTS)/{sp},scale=1920:1080,setsar=1,framerate=fps={FPS}'
            run(*FF, '-i', src, '-vf', vf, '-t', f'{dur:.3f}', *ENC, out)
        elif s[0] == 'still':
            _, img, dur, cx, cy, z0, z1 = s; n = round(dur * FPS); img = still_src(img)
            # zoom around (cx, cy), kept inside the frame; upscale x2 first for a smooth zoom
            z = f'({z0}+({z1}-{z0})*on/{max(n - 1, 1)})'
            x = f'max(0,min(iw-iw/zoom,{2 * cx}-iw/zoom/2))'; y = f'max(0,min(ih-ih/zoom,{2 * cy}-ih/zoom/2))'
            vf = f'scale=3840:2160,zoompan=z=\'{z}\':x=\'{x}\':y=\'{y}\':d={n}:s=1920x1080:fps={FPS},setsar=1'
            run(*FF, '-loop', '1', '-i', img, '-vf', vf, '-frames:v', str(n), *ENC, out)
        else:
            run(*FF, '-f', 'lavfi', '-i', f'color=black:s=1920x1080:r={FPS}', '-t', str(s[1]), *ENC, out)
    # blurred cross-fades between some consecutive segments (merged into one part first)
    xf = dict((i, d) for i, d in TL.get('xfades', []))
    merged, i = [], 0
    while i < len(parts):
        if i in xf:
            j = i; chain = [parts[i]]
            while j in xf: j += 1; chain.append(parts[j])
            out = f'{B}/xf_{i:02d}.mp4'; fc, prev, off = '', '[0:v]', 0.0
            for k in range(1, len(chain)):
                dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', chain[k - 1]], capture_output=True, text=True).stdout)
                off += dur - xf[i + k - 1]
                fc += f'{prev}[{k}:v]xfade=transition=hblur:duration={xf[i + k - 1]}:offset={off:.3f}[x{k}];'; prev = f'[x{k}]'
                off = off  # next offset accumulates from the merged stream
            run(*FF, *sum([['-i', c] for c in chain], []), '-filter_complex', fc.rstrip(';'), '-map', prev, *ENC, out)
            merged.append(out); i = j + 1
        else:
            merged.append(parts[i]); i += 1
    parts = merged
    inputs = sum([['-i', p] for p in parts], [])
    fc = ''.join(f'[{i}:v]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=0[v]'
    run(*FF, *inputs, '-filter_complex', fc, '-map', '[v]', *ENC, f'{B}/video.mp4')

SR = 44100
def load(path):
    tmp = f'{B}/_a.wav'; run(*FF, '-i', path, '-ac', '1', '-ar', str(SR), '-sample_fmt', 's16', tmp)
    w = wave.open(tmp); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

def audio():
    D = TL['duration']; mix = np.zeros(int((D + 1) * SR), np.float32); voice = np.zeros_like(mix)
    def put(buf, x, t, g=1.0):
        i = int(t * SR); x = x[:max(0, len(buf) - i)]; buf[i:i + len(x)] += g * x
    V = {f: load(f'audio/{f}.mp3') for f in ('narration', 'fausse', 'fausse2', 'vraie', 'vraie_listen', 'luna_souffle_ok')}
    for f, a, b, v in TL['audio']:
        if f.endswith('_grave'):   # slower and lower: resample at a lower rate
            x = V[f[:-6]][int(a * SR):int(b * SR)]; k = TL['grave']
            x = np.interp(np.arange(0, len(x), k), np.arange(len(x)), x).astype(np.float32)
        else:
            x = V[f][int(a * SR):int(b * SR)]
        fade = np.minimum(1, np.minimum(np.arange(len(x)), np.arange(len(x))[::-1]) / (0.01 * SR))
        put(voice, x * fade, v)
    S = {}
    for f, t, g, dur in TL['fx']:
        if f not in S: S[f] = load(f'../../sons/{f}.wav')
        x = S[f]
        if dur:
            reps = int(np.ceil(dur * SR / len(x))) + 1; x = np.tile(x, reps)[:int(dur * SR)]
            n = len(x); x = x * np.minimum(1, np.minimum(np.arange(n), np.arange(n)[::-1]) / (0.15 * SR))
        if f == 'drone':   # whole video, looped, swelling at the key moments
            n = len(mix); x = np.tile(x, int(np.ceil(n / len(x))))[:n]
            tt = np.arange(n) / SR
            sw = 0.6 + 0.4 * np.exp(-((tt - 20) / 4) ** 2) + 0.5 * np.exp(-((tt - 77) / 5) ** 2) + 0.3 * np.exp(-((tt - 44) / 4) ** 2)
            sw *= np.where((tt > 27.3) & (tt < 28.6), 0.25, 1.0)   # "Silence."
            sw *= np.where((tt > 7.0) & (tt < 8.0), 0.2, 1.0)     # hush just before the face is revealed
            sw *= np.clip((D - tt) / 1.5, 0, 1)
            x = x * sw
        put(mix, x, t, g)
    # duck effects under the voices a little
    env = np.convolve(np.abs(voice), np.ones(4410) / 4410, mode='same')
    mix = mix * (1 - 0.35 * np.clip(env * 12, 0, 1)) + voice * 1.0
    mix = mix[:int(D * SR)]
    x = (np.clip(mix / (np.abs(mix).max() + 1e-9) * 0.9, -1, 1) * 32767).astype(np.int16)
    w = wave.open(f'{B}/mix_brut.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes()); w.close()
    run(*FF, '-i', f'{B}/mix_brut.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89', '-ar', str(SR), '-ac', '2', 'audio/mix.wav')

def overlay():
    run('node', 'rendre_overlay.js', f'{B}/overlay')

def final():
    D = TL['duration']
    grade = (f"eq=saturation=0.88:contrast=1.06:brightness='0.012*sin(t*9)*sin(t*2.3)':eval=frame,"
             f"vignette=PI/5.5,noise=alls=5:allf=t,fade=t=out:st={D - 1.2:.2f}:d=1.2")
    fc = f'[0:v]{grade}[g];[g][1:v]overlay=0:0:format=auto[v]'
    run(*FF, '-i', f'{B}/video.mp4', '-framerate', str(FPS), '-i', f'{B}/overlay/o_%04d.png', '-i', 'audio/mix.wav',
        '-filter_complex', fc, '-map', '[v]', '-map', '2:a', '-af', 'volume=1.7dB,alimiter=limit=0.84:level=false', '-t', f'{D:.2f}',
        '-c:v', 'libx264', '-preset', 'medium', '-b:v', '7M', '-maxrate', '9M', '-bufsize', '18M', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'v04_maman_episode2.mp4')

if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    for name, fn in (('video', video), ('audio', audio), ('overlay', overlay), ('final', final)):
        if what in (name, 'all'): print('->', name); fn()
