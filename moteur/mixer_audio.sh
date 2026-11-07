#!/usr/bin/env bash
# Usage : ./mixer_audio.sh voix.mp3 musique.mp3 DUREE_TOTALE SORTIE.wav [DEBUT_MUSIQUE=0] [OUVERTURE=4]
# - musique etouffee (passe-bas) jusqu'a OUVERTURE secondes, puis pleine
# - la musique baisse automatiquement quand la voix parle (ducking)
# - fondu final de 2 s, volume final -14 LUFS (standard TikTok)
set -e
V=$1; M=$2; D=$3; OUT=$4; OFF=${5:-0}; OPEN=${6:-4}
A=$(echo "$OPEN - 0.3" | bc); F=$(echo "$D - 2" | bc)
ffmpeg -loglevel error -y -i "$V" -i "$M" -filter_complex "
[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=$D,asplit=2[v][vk];
[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start=$OFF:duration=$D,asetpts=PTS-STARTPTS,asplit=2[ma][mb];
[ma]lowpass=f=450,lowpass=f=450,volume=1.15,volume='if(lt(t,$A),1,if(lt(t,$OPEN),($OPEN-t)/0.3,0))':eval=frame[lo];
[mb]volume='if(lt(t,$A),0,if(lt(t,$OPEN),(t-$A)/0.3,1))':eval=frame[hi];
[lo][hi]amix=inputs=2:normalize=0,volume='min(1,t/0.8)*if(gt(t,$F),max(0,($D-t)/2),1)':eval=frame,volume=0.28[m];
[m][vk]sidechaincompress=threshold=0.015:ratio=5:attack=15:release=380[duck];
[v][duck]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]" -map "[out]" -c:a pcm_s16le "$OUT"
echo "Audio pret : $OUT"
