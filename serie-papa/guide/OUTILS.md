# Les outils techniques

## Coûts de référence (ElevenLabs)

| Élément | Crédits | ≈ $ |
|---|---|---|
| Plan vidéo Kling 2.5 Turbo, 5 s (5 ou 10 s seulement) | 2 121 | 0,39 |
| Image IA (Gemini Flash Image) | ≈ 610 | 0,11 |
| Détourage (birefnet) | 30 | 0,005 |
| Voix eleven_v4 | ≈ 15 crédits / seconde de voix | |

Toujours : estimation gratuite (`estimate_only`), accord de l'utilisateur, **un plan à la fois**.

## Images de départ

- Planches et images de départ des personnages : `../<nom>_depart_16x9.png`, références dans `../../personnages/references/`.
- **Fond sombre** : détourer avec ElevenLabs `birefnet-v2-bg-removal` (30 crédits) → fichier `cut/<nom>_clean.png`.
- **Fond orange** : le détourage maison `cutout.py` suffit (les traces se fondent dans le fond).
- Composer le décor au trait en HTML/SVG (`depart.html` dans chaque dossier vidéo) puis capture Playwright.
- Mieux encore : donner à l'utilisateur un **prompt** pour qu'il fabrique l'image lui-même (même esprit que les images validées, angle exagéré, décor au trait blanc, fond uni, écran de téléphone vide, espace libre en haut pour les sous-titres).
- Pour Kling, mettre l'image en ligne sur la branche GitHub (dépôt public) puis `creative_attach_reference_file` avec l'URL `raw.githubusercontent.com`.
- Prompt Kling : toujours « keep every detail unchanged », « flat solid … background with only simple white line-art outlines, do not add texture, shading or new details », « keep empty headroom at the top of the frame », « no text, no logos ».

## Montage (dossier d'exemple : `../videos/v03_maman/`)

- `timeline.py` → `timeline.json` / `timeline.js` : place les morceaux de voix, construit les sous-titres (1–2 mots, calés sur la transcription), mots clés en couleur, icônes, textes, cartes de notification.
- `overlay.html` + `rendre_overlay.js` : couche transparente (sous-titres Anton, icônes au trait, textes, **notifications « Mom »**) rendue image par image.
- Segments vidéo : `ffmpeg` (découpe, `zoompan` pour les images figées zoomées, recadrage), concaténation par le filtre `concat` (pas le démultiplexeur, qui décale les durées).
- Étalonnage scary : `eq` (désaturé, contraste, vacillement), `vignette`, `noise`.
- Export final : **débit limité** (`-b:v 9M -maxrate 12M`) sinon le grain fait exploser la taille (GitHub refuse > 100 Mo).
- Volume final −14 LUFS (`loudnorm` + `alimiter`), vérifié avec `ebur128`.

## Sons (gratuits, `../sons/fabriquer_sons.py`)

`whoosh`, `pop`, `pas`, `wouf`, `impact`, `notification`, `chaise`, `scan`, `boing`, `vibration`, `poele`, `drone`, `coeur`.
Ajouter un son = ajouter quelques lignes dans ce script, puis relancer `python3 fabriquer_sons.py`.

## Voix (ne plus les tester)

| Rôle | Voix | voice_id |
|---|---|---|
| Narrateur calme / mystérieux | Frank | `AzNAdnjXVngDJxC7HGpY` |
| Papa | Miller | `pCL8Ua4MoAGISUaDmw69` |
| Le Sportif | Knox | `cgLpYGyXZhkyalKZ0xeZ` |
| Sophie | Marie | `Bv9P233zucGXSrswwl5g` |
| Alex | Terence | `hnhGxwvHP8fc469w51rM` |
| Victoria | Morgan | `PzfaLH4z7mk2kjv7sqpV` |
| Dr. Gabriel | Christian | `x6vtE4TgM6a0on8gvQac` |
| Luna | Veronica | `ejl43bbp2vjkAFGSmAMa` |
| Léo | Teddy Twinkle | `XjGYkUkzth8BPs29fmcV` |
| Adam | Aaron | `B6uUx2p7cRgxseOUyP6P` |
| ROBI | Vector | `NoiYxL9g25M4orC8Q0ls` |
| Max | pas de voix, bruitages | |

Modèle `eleven_v4`, anglais américain, **une seule prise**, balises d'émotion entre crochets (`[whispering]`, `[pause]`).
