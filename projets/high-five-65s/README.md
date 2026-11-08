# The Intersection That Became a Monster (Dallas High Five) — 69 s

Storyboard fourni par l'utilisateur (65 s), horizontal 1920×1080, fond noir, héros jaune.

- Voix : ElevenLabs Quentin (`eleven_v4`, 1 prise, script avec émotions). Transcription vérifiée mot à mot : `words.js`.
- Fait corrigé : « five stories tall » → « five levels high » (5 niveaux : US-75 enterrée, routes de desserte au sol, I-635, deux niveaux de rampes ; ~100–120 ft). Sources : Wikipédia « High Five Interchange », Practical Engineering.
- Effets : 11 sons ElevenLabs (`audio/sfx/`), placés par `audio/sfx_plan.py`.
- Musique : « Wallpaper » de Kevin MacLeod (incompetech.com), licence CC BY 4.0 → **citer l'auteur dans la description**.

## Commandes (depuis `moteur/`)
```bash
PAGE=../projets/high-five-65s/index.html node preview.js /dossier 4.8 20.4 56.9
PAGE=../projets/high-five-65s/index.html node render_par.js /dossier/video_sans_son.mp4 4
cd ../projets/high-five-65s/audio && python3 sfx_plan.py && ../../../moteur/mixer_audio.sh voix_sfx.wav musique_wallpaper.mp3 69.0 audio_final.wav 0 0.5
```
