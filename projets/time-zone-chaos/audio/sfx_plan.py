# Effets sonores (temps calés sur words.js), gain dB, durée max
import subprocess
D = 73.6
W = [[0.0,'tick',-6,2.6],[3.1,'rewind',-6,1.4],[5.62,'impact',0,1.0]]
for t in [7.3,13.0,21.3,31.0,39.1,48.0,55.4,61.6,68.1]: W.append([t,'whoosh',-13,1.0])
W += [[9.95,'forward',-9,1.0],[12.2,'rewind',-10,1.0],[14.75,'rewind',-9,1.2],[16.38,'glitch',-10,0.6],[17.0,'impact',-9,1.0],
      [20.12,'pop',-10,0.4],[20.25,'pop',-12,0.4],[23.14,'ping',-8,1.0],[24.46,'ping',-8,1.0],[28.6,'pop',-10,0.4],[29.85,'impact',-10,1.0],
      [32.9,'ping',-8,1.0],[33.64,'ping',-8,1.0],[36.3,'rewind',-10,0.9],[37.9,'impact',-9,1.0],
      [40.0,'train',-7,3.0],[43.0,'train',-9,2.6],[46.8,'scratch',-3,1.0],[48.84,'impact',-6,1.0],
      [51.1,'puzzle',-8,1.0],[52.4,'puzzle',-10,1.0],[52.75,'puzzle',-10,1.0],[53.1,'puzzle',-10,1.0],[53.45,'puzzle',-10,1.0],
      [55.5,'tick',-10,2.0],[57.1,'tick',-12,2.0],[60.55,'impact',-6,1.0],[62.06,'chime',-6,1.6],[64.32,'forward',-6,1.0],
      [67.5,'glitch',-14,0.5],[68.7,'pop',-8,0.4],[68.85,'pop',-9,0.4],[72.0,'pop',-4,0.4]]
inp, flt = [], []
for i,(t,n,g,d) in enumerate(W):
    inp += ['-i', f'sfx/{n}.mp3']
    flt.append(f"[{i}:a]atrim=0:{d},afade=t=out:st={max(0,d-0.15)}:d=0.15,volume={g}dB,aresample=48000,aformat=channel_layouts=stereo,adelay={int(t*1000)}|{int(t*1000)}[s{i}]")
flt.append(''.join(f'[s{i}]' for i in range(len(W))) + f"amix=inputs={len(W)}:normalize=0:duration=longest,apad=whole_dur={D},atrim=0:{D}[out]")
subprocess.run(['ffmpeg','-loglevel','error','-y',*inp,'-filter_complex',';'.join(flt),'-map','[out]','sfx.wav'],check=True)
subprocess.run(['ffmpeg','-loglevel','error','-y','-i','voix_echo.wav','-i','sfx.wav','-filter_complex',
  f"[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur={D}[v];[v][1:a]amix=inputs=2:normalize=0,atrim=0:{D}[o]",'-map','[o]','voix_sfx.wav'],check=True)
print(len(W),'effets places')
