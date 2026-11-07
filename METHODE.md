# Méthode : fabriquer une nouvelle vidéo

## Règles de travail (à respecter à chaque vidéo)
1. **Poser les questions avant de faire quoi que ce soit.** Ne rien inventer : rester sur le contenu fourni.
2. Reformuler la vidéo de référence **avec ses propres mots**, en gardant sa structure et son rythme.
3. Montrer le **script complet** et le **coût en crédits** (estimation gratuite) avant toute génération.
4. Voix : **Quentin par défaut**, en **1 seule prise**. Images : ElevenLabs est autorisé, mais **toujours demander l'accord (avec le coût) avant** de générer.
5. Vérifier la voix par transcription mot à mot avant d'animer.
6. Montrer des images d'aperçu avant le rendu complet (gratuit, rapide).

## Étapes
1. **Analyser la référence** : télécharger la vidéo TikTok, la transcrire, extraire des images (style, rythme, structure).
2. **Questions** : sujet, langue/public, durée, **fond**, **musique**, formes et rôles des personnages, sous-titres complets ou mots-clés, fin de vidéo.
3. **Script** : tableau phrase par phrase (anglais + sens en français) → validation.
4. **Voix** : estimation du coût → accord → génération Quentin (1 prise) → téléchargement.
5. **Transcription** :
   ```bash
   cd moteur && ./setup.sh
   ffmpeg -i voix.mp3 -ac 1 -ar 16000 voix.wav
   .venv/bin/python -I transcrire_mots.py voix.wav words.js "Première phrase du script"
   ```
   → `words.js` contient chaque mot avec son minutage : vérifier que le texte est exact.
6. **Animation** : personnages style nouille avec `rig2.js` (`makeNoodle`, voir `moteur/proto.js`) ; copier `exemples/letter-A/story.js` dans `moteur/story.js` comme base de mise en scène et de sous-titres (dans `index.html`, charger `rig2.js`), puis écrire les scènes avec les temps des mots (personnage `hero([...])`, autres `other([...])`, décors, sous-titres déjà inclus en bas du fichier). Régler `window.DURATION`.
7. **Aperçus** (format horizontal par défaut, ajouter `FORMAT=vertical` pour du vertical) : `THEME=creme node preview.js /dossier/sortie 2.0 10.5 33.0 ...` → vérifier chaque scène.
8. **Rendu** : `THEME=creme node render_par.js /dossier/video_sans_son.mp4 3` (ou `THEME=noir`) (≈ 25–40 min pour 1 min 40).
9. **Corriger un passage** sans tout refaire : `node render_range.js patch.mp4 IMAGE_DEBUT IMAGE_FIN` puis l'insérer avec ffmpeg (overlay `enable='between(t,a,b)'`).
10. **Audio** : `./mixer_audio.sh voix.mp3 MUSIQUE.mp3 DUREE audio.wav 0 MOMENT_OUVERTURE` (ne plus utiliser la musique tech house)
11. **Assemblage** : `./assembler.sh video_sans_son.mp4 audio.wav finale.mp4`
12. **Vérification finale** : planche d'images toutes les 3 s + niveau sonore −14 LUFS.
13. **Couverture** + **description** TikTok (anglais, question + 5–6 hashtags, pas de localisation).

## Exemples inclus
Ces deux exemples ont été faits en **vertical** : pour les rejouer, lancer les commandes avec `FORMAT=vertical`. Les nouvelles vidéos se font en horizontal.
- `exemples/world-finance-5-business/` : vidéo motion design (icônes au trait, compteurs dorés/verts, barre de progression 01–05, question finale). Utilise `engine.js` sans personnage. `thumb.js` = couverture animée.
- `exemples/letter-A/` : vidéo avec personnage articulé + sous-titres mot à mot (`story.js` + `words.js`).
