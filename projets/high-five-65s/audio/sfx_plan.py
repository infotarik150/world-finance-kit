# Placement des effets sonores (temps en secondes, calés sur words.js), gain en dB, durée max
import subprocess
W = [0.95,'screech',-6,1.2],[2.0,'boom',-3,1.1],[2.55,'riser',-9,1.1],[3.68,'pop',-12,0.4]
W = list(W)
for t in [5.5,13.1,20.9,28.6,36.4,45.9,50.3,57.0,63.5]: W.append([t,'whoosh',-13,1.0])
for i in range(4): W.append([8.14+i*0.12,'pop',-15,0.3])
W += [[11.85,'screech',-9,0.8],[12.05,'horn',-9,1.2],[14.35,'click',-8,0.6],[19.95,'screech',-11,0.5],[20.28,'crash',-4,1.6],
      [22.3,'click',-8,0.6],[35.15,'click',-9,0.6]]
for i in range(4): W.append([38.62+i*0.12,'pop',-14,0.3])
W += [[44.4,'horn',-9,1.2],[47.5,'truck',-6,2.6],[49.3,'screech',-9,1.0],[51.2,'clang',-8,1.0],[52.3,'clang',-8,1.0],[53.3,'clang',-8,1.0]]
for t in [54.58,54.9,55.22,55.54]: W.append([t,'clang',-5,1.0])
W += [[55.65,'riser',-6,1.05],[56.66,'boom',0,1.1]]
for i in range(5): W.append([59.04+i*0.2,'pop',-14,0.3])
W += [[62.25,'sting',-6,2.0],[65.82,'pop',-6,0.4],[67.36,'pop',-11,0.4]]
D = 69.0
inp, flt = [], []
for i,(t,n,g,d) in enumerate(W):
    inp += ['-i', f'sfx/{n}.mp3']
    flt.append(f"[{i}:a]atrim=0:{d},afade=t=out:st={max(0,d-0.15)}:d=0.15,volume={g}dB,aresample=48000,aformat=channel_layouts=stereo,adelay={int(t*1000)}|{int(t*1000)}[s{i}]")
flt.append(''.join(f'[s{i}]' for i in range(len(W))) + f"amix=inputs={len(W)}:normalize=0:duration=longest,apad=whole_dur={D},atrim=0:{D}[out]")
subprocess.run(['ffmpeg','-loglevel','error','-y',*inp,'-filter_complex',';'.join(flt),'-map','[out]','sfx.wav'],check=True)
# voix + effets
subprocess.run(['ffmpeg','-loglevel','error','-y','-i','voix.mp3','-i','sfx.wav','-filter_complex',
  f"[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur={D}[v];[v][1:a]amix=inputs=2:normalize=0,atrim=0:{D}[o]",'-map','[o]','voix_sfx.wav'],check=True)
print(len(W),'effets places')
