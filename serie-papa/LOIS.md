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

## Loi 3 — L'environnement
- Décor **simple et moderne**, **focus sur le personnage**.
- Le lieu (chambre, bureau, cuisine, salle de sport…) est dessiné **uniquement en contours blancs**, au trait fin et régulier, sur le **fond de couleur unie** de la scène (loi 1). Pas de textures, pas d'ombres, pas de remplissage.
- **Exception : les personnages** restent en 3D complète, avec tous les détails de leur planche.
- Juste les éléments utiles pour comprendre le lieu (3 à 6 objets : fenêtre, lit, lampe, étagère, cadre…), sans encombrer, et jamais dans la zone des sous-titres (loi 2).
- Fabrication : l'image de départ est composée gratuitement (personnage détouré de sa planche + décor au trait blanc + fond uni), puis animée par l'IA avec la consigne « keep the background as flat solid colour with simple white line-art outlines, do not add details ».
- Aperçu : `serie-papa/apercu_environnement_chambre.png`.

## Loi 4 — Les icônes
- Des **icônes apparaissent pour montrer une idée** (ampoule = idée, pièces = argent, cœur = amour, horloge = temps, etc.).
- Même style que le décor (loi 3) : **contours blancs au trait**, simples et modernes, sans remplissage, d'une seule couleur (blanc, ou brun très foncé sur fond clair).
- Elles **apparaissent au moment exact** où l'idée est dite (calées sur le mot de la voix), avec une petite animation d'entrée (pop, rebond, tracé qui se dessine), puis disparaissent ou se transforment quand l'idée change.
- Placées **à côté du personnage**, jamais sur son visage ni dans la zone des sous-titres (loi 2) ; 1 à 2 icônes à la fois maximum.
- Ajoutées au montage par-dessus la vidéo IA (gratuit, précis au mot près).
- Aperçu : `serie-papa/apercu_icones.png`.
