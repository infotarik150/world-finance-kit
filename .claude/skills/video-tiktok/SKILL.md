---
name: video-tiktok
description: Fabriquer une vidéo (format horizontal 1920×1080 par défaut) dans le style « World Finance » (personnages style nouille : héros bulle jaune moutarde, autres en formes créatives ; fond choisi à chaque vidéo ; sous-titres mot à mot ; voix ElevenLabs Quentin). À utiliser seulement pour le style « World Finance » (personnages nouille). Pour la série avec Papa, Sophie, Luna, etc., utiliser le skill `serie-papa`.
---

# Vidéo TikTok — style World Finance

Lis d'abord `STYLE.md` (charte) et `METHODE.md` (étapes) à la racine du dépôt, puis suis-les.

## Règles non négociables de l'utilisateur
- Répondre en français. L'utilisateur relit tout depuis son téléphone : messages courts et clairs.
- **Poser les questions avant d'agir**, ne rien inventer, rester sur le thème donné.
- Reformuler avec ses propres mots sans changer la structure ni le rythme de la référence.
- **Économiser les crédits** : estimer le coût (`estimate_only`) et obtenir l'accord avant toute génération ; voix en **1 seule prise** (`generations_count: 1`).
- Voix : **toujours** ElevenLabs « Quentin – Narrator and Educator » (`Aa6nEBJJMKJwJkCx8VU2`), `eleven_v4`, anglais américain, sauf si l'utilisateur demande une autre voix.
- Images : ElevenLabs est autorisé, **après avoir demandé l'accord** (montrer le coût estimé avant).
- Fond : **demander à chaque vidéo** (plus de bleu nuit ; thèmes prêts `THEME=creme` / `THEME=noir`), personnages et éléments bien contrastés.
- Musique : **demander à chaque vidéo** ; ne plus utiliser la tech house.
- Personnages : style « nouille » (`moteur/rig2.js`). Héros = bulle de dialogue **jaune moutarde, contour plus gras** ; autres = formes créatives selon le scénario (carré, triangle, étoile, croissant…), couleurs assorties au fond.
- Format : **horizontal 1920×1080 par défaut** (vertical seulement si l'utilisateur le demande, `FORMAT=vertical`).
- Le personnage doit être grand, souple et expressif. Les idées visuelles doivent être des métaphores créatives, pas des icônes qui apparaissent et disparaissent.
- Vérifier soi-même (transcription, planches d'images) avant de livrer ; dire honnêtement ce qui n'a pas été vérifié (le son ne peut pas être écouté).

## Outils du dépôt
- `moteur/` : `engine.js` (fond, glow, icônes, compteurs), `rig2.js` (personnages style nouille, par défaut), `rig.js` (ancien personnage, 29 poses), `proto.html`/`proto.js` (aperçu des personnages), `index.html` (dégradés et filtres), `preview.js`, `render_par.js`, `render_range.js`, `transcrire_mots.py`, `mixer_audio.sh`, `assembler.sh`, `setup.sh`.
- `assets/` : logo, exemples de couvertures, aperçu des deux thèmes.
- `exemples/` : deux vidéos complètes servant de modèles.
