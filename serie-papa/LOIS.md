# Les lois de la série

Règles données par l'utilisateur, à respecter pour **chaque vidéo**.

## Loi 1 — Les fonds
- Couleurs possibles : **orange, jaune, vert pistache, bleu ciel, bleu nuit, violet, crème**, ou d'autres selon le contenu.
- **Plusieurs couleurs dans la même vidéo** : le fond peut changer d'une scène à l'autre. On ne garde pas une seule couleur pour toute une vidéo.
- La couleur se choisit selon le contenu et l'ambiance de chaque scène.
- Les images de départ des personnages sont sur fond orange : pour une autre couleur, on change le fond (le prompt ou l'image de départ), jamais le personnage.

## Loi 2 — Les sous-titres
- **Toujours** des sous-titres, mot à mot : **1 mot à la fois, 2 mots maximum** d'un coup, calés sur la voix.
- **Police** : style de la référence `serie-papa/reference_police_sous_titres.jpg` → police gratuite **Anton** (`serie-papa/polices/Anton-Regular.woff`, licence SIL OFL, usage commercial autorisé), en MAJUSCULES.
- **Taille moyenne**, bien visible sans envahir l'image (≈ 100 px de haut en 1920×1080).
- **Pas de contour** (ni contour ni effet autour des lettres) : lettres pleines, d'une seule couleur, comme la référence.
- **Contraste par la couleur** : blanc sur les fonds foncés ou saturés (orange, bleu nuit, violet, vert pistache), brun très foncé `#2A1A10` sur les fonds clairs (crème, jaune, bleu ciel). On choisit la couleur scène par scène pour que le mot se lise bien.
- **Position** : centré, en haut de l'écran (≈ 50–150 px du haut), pour **ne jamais cacher le visage** des personnages ni le contenu.
- Pour garder cette zone libre, les plans sont cadrés avec de l'espace au-dessus de la tête (dans l'image de départ, le haut de la tête commence au moins à ≈ 300 px du haut ; « keep empty headroom at the top of the frame » dans le prompt). Si un gros plan monte trop haut, on décale le sous-titre au cas par cas.
- Aperçu : `serie-papa/apercu_sous_titres.html`.
