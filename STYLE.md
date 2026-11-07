# Charte visuelle — style « World Finance »

## Fond et contraste (plus de fond bleu nuit)
**Le fond se choisit avec l'utilisateur à chaque vidéo** (le demander). Thèmes prêts : `THEME=creme` ou `THEME=noir` (voir METHODE.md) ; on peut en ajouter dans `THEMES` (`moteur/engine.js`).

| | Thème **noir** | Thème **crème** |
|---|---|---|
| Fond | Noir profond, très légère lumière qui bouge, grain fin | Blanc crème (`#F3EADB`), centre plus clair, bords légèrement plus chauds |
| Héros | Blanc chrome (`#EEF0F3`) | Brun foncé (`#3B2719`), yeux crème |
| Autres personnages | Gris (`#7E828A`) | Beige-brun clair (`#B7A28B`) |
| Décors (meubles, marches) | Gris anthracite | Beige |
| Texte | Blanc, mots à venir en gris | Brun très foncé, mots à venir en beige |
| Effets | Halos lumineux | Ombres douces (un halo salit un fond clair) |

Les couleurs se règlent à un seul endroit : `THEMES` dans `moteur/engine.js`. On peut y ajouter un autre thème.

## Couleurs d'accent (dans les deux thèmes)
| Rôle | Couleur |
|---|---|
| Argent, fortune, réussite | Doré en dégradé (plus foncé sur le crème pour rester lisible) |
| Gain, succès, résultat | Vert en dégradé |
| Risque, perte, rupture | Rouge en dégradé, jamais plat, **seulement si le contenu en parle** |

## Typographie
- Police **Inter** / **Inter Display** (déjà installée dans l'environnement cloud).
- Titres et chiffres : Inter Display 700–800.
- Petits libellés : majuscules espacées (letter-spacing 6–12).
- Sous-titres : Inter 700, 58 px, mot prononcé en couleur de texte du thème, mots à venir atténués, mot-clé en doré.

## Les personnages — style « nouille » (`moteur/rig2.js`, style par défaut)
Inspiré des références de l'utilisateur : corps = forme simple d'une couleur unie, contour noir fin **décalé** de la couleur et ouvert par endroits, bras et jambes « nouilles » (tubes blancs cernés), mains dessinées (doigts, poing, doigt pointé), visage minimaliste, ligne de sol.
- **Héros** : toujours une **bulle de dialogue jaune moutarde** (`#E3A82B`) avec un **contour plus gras** que les autres → `makeNoodle(parent, keys, { hero: true })`.
- **Autres personnages** : forme **créative choisie selon le scénario** (`square`, `triangle`, `star`, `crescent`, `heart`, `diamond`, `hexagon`, `round`, `blob`… on peut en ajouter dans `SHAPES`), couleurs qui vont avec le fond (`colorIndex` dans la palette `NPAL`).
- Contours et membres s'adaptent au fond (noir sur crème, blanc sur noir) ; les visages restent toujours foncés.
- Poses : `stand, wave, shrug, point, think, happy, sad, proud, shout, hugSelf, sitLedge, walk` (à compléter selon les besoins).
- Aperçus : `assets/apercu_format_horizontal.png` (format par défaut) et `assets/apercu_personnages_style_nouille.png`.

L'ancien personnage (`moteur/rig.js`, utilisé dans « Letter A ») reste disponible.

## Mise en scène
- **Format horizontal 1920×1080 (16:9), 30 images/s, par défaut.** Le vertical 1080×1920 reste possible avec `FORMAT=vertical`.
- Dans le moteur, utiliser `W`, `H`, `CX`, `CY` plutôt que des positions fixes, pour que les scènes s'adaptent au format.
- Garder titres et sous-titres dans le haut de l'image, le sol vers `H - 150`, et une marge d'au moins 80 px sur les côtés.
- Pas de coupes sèches : fondus, glissements de caméra, transformations.
- Une idée visuelle par phrase, calée au mot près sur la voix.
- Une **métaphore** par idée (pas juste une icône qui apparaît) : porte qui s'ouvre, fil doré qui casse, rocher à pousser, bloc « PRESSURE », fissures qui s'accumulent…

## Son
- Voix ElevenLabs **Quentin – Narrator and Educator** (`voice_id: Aa6nEBJJMKJwJkCx8VU2`), modèle `eleven_v4`, anglais américain.
- Voix par défaut : **toujours Quentin**, sauf si l'utilisateur demande d'en changer.
- Musique : **demander à l'utilisateur à chaque vidéo** (fichier fourni, musique générée après accord sur le coût, ou aucune musique). Ne plus utiliser la tech house. Placement : discrète au début, baisse automatique sous la voix, fondu final. Volume final −14 LUFS.

## Fin de vidéo
- Question qui fait commenter (ex. « WHICH ONE WOULD YOU START? — COMMENT 01–05 »), puis « FOLLOW FOR MORE ».
