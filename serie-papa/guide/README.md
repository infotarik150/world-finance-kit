# Guide de la série — style, façon de penser, façon de créer

Ce dossier rassemble **tout ce qu'il faut pour refaire une vidéo de la série** sans repartir de zéro.
Il complète, sans les remplacer : les lois (`../LOIS.md`), les règles de travail (`../METHODE_SERIE.md`) et les fiches personnages (`../../personnages/`).

| Fichier | Contenu |
|---|---|
| `README.md` (ce fichier) | L'esprit de la série et la démarche, étape par étape |
| `AMBIANCES.md` | Le tableau par genre : scary, business, sport, funny, psycho → personnages, fonds, angles de caméra, lumière, sons, sous-titres |
| `OUTILS.md` | La partie technique : scripts, détourage, montage, sons, coûts |

---

## 1. L'esprit de la série

- **Les personnages sont des acteurs** : on ne raconte pas « leur » histoire, on leur donne un rôle dans le scénario du jour.
- **On choisit tout en fonction du contenu** : quels personnages, quelles couleurs de fond, quels angles de caméra, quelle atmosphère. Rien n'est fixe d'une vidéo à l'autre, tout sert l'histoire.
- **Le personnage est au centre** : personnages 3D fidèles à leur planche, décor minimal au trait blanc sur fond de couleur unie.
- **Ce que l'on montre doit se comprendre au premier coup d'œil** : une différence (rangé / dérangé), un lieu (maman en bas de l'escalier), une émotion. Si ça demande une explication, c'est raté.
- **Format** : horizontal 1920×1080, anglais américain (public USA), sous-titres mot à mot en Anton.

## 2. Les 4 choix à faire pour chaque vidéo (avant tout le reste)

1. **Le genre / l'atmosphère** : scary, business, sport, funny, psycho… (voir `AMBIANCES.md`).
2. **Les personnages** : ceux dont le rôle colle au scénario (voir la liste dans `../../personnages/README.md`). Pas plus que nécessaire. On peut proposer un nouveau personnage si l'histoire l'exige ; l'utilisateur décide.
3. **Les fonds** : plusieurs couleurs dans une même vidéo, choisies scène par scène selon l'ambiance (loi 1). Ex. : vidéo scary = bleu nuit presque noir et violet profond, **jamais** d'orange vif.
4. **Les angles de caméra** : choisis pour l'émotion (contre-plongée = menace / puissance, plongée = vertige / faiblesse, vue subjective = s'identifier, plan penché = malaise, plan large = situation, gros plan = émotion).

Ces 4 choix se présentent à l'utilisateur avec le script, **avant toute dépense**.

## 3. La démarche, étape par étape

1. **Analyser la référence** (si l'utilisateur donne une vidéo) : transcription, images clés, structure, rythme.
2. **Proposer** : distribution (qui joue quoi), script réécrit avec nos mots (même structure et même rythme), genre, fonds, angles, voix, et **coût estimé**.
3. **Valider chaque plan avant de dépenser** :
   - montrer l'**image de départ** de chaque plan ;
   - l'utilisateur peut fournir lui-même l'image de départ (on lui donne alors un **prompt** prêt à l'emploi, dans le même esprit que les images déjà validées) ;
   - **un seul plan à la fois**, on le montre, on continue seulement après accord.
4. **Voix** (une seule prise chacune), puis transcription mot à mot pour caler sous-titres et icônes.
5. **Montage** (gratuit) : plans + réutilisations intelligentes (zoom, cadre serré, image figée) quand ça sert le scénario, sous-titres, icônes, notifications, sons, étalonnage d'ambiance.
6. **Vérifier soi-même** (planche d'images, volume −14 LUFS) et dire honnêtement ce qui ne va pas.
7. **Pousser** sur la branche et noter dans `../METHODE_SERIE.md` toute leçon apprise.

## 4. Ce qui a marché (à refaire)

- **Images de départ préparées par l'utilisateur** à partir d'un prompt donné par Claude : contre-plongée exagérée de la cuisine, vue subjective dans l'escalier (vidéo 03). Résultat très supérieur aux compositions faites à la main.
- **Angles « Hitchcock »** pour le suspense : contre-plongée au ras du sol, vue subjective avec effet vertige, plan penché.
- **Réutiliser un bon plan plusieurs fois** avec un cadrage différent, figé ou zoomé, seulement si ça sert l'histoire.
- **Notifications graphiques à côté du téléphone** (cartes « Mom », trois petits points, message) plutôt que du texte collé sur l'écran.
- **Détourage ElevenLabs** (30 crédits) pour poser un personnage proprement sur un fond sombre.
- **Mots clés des sous-titres en rouge** pour le suspense (HIDE, PASSWORD, BEHIND…).

## 5. Ce qui a raté (à ne pas refaire)

- Dessiner soi-même un objet clé (la chaise de la vidéo 02) → forme fausse et animation catastrophique. **Toujours une vraie image 3D de l'objet.**
- Lancer plusieurs plans IA d'un coup sans plan d'essai.
- Un fond orange vif dans une vidéo de nuit / scary.
- Un écran de téléphone fixe avec du texte immobile, ou du texte collé et suivi sur l'écran d'une vidéo IA.
- Une différence trop petite pour être vue (chaise à peine décalée).
- Des bruitages répétés mécaniquement (pas, whoosh à chaque coupe).
- Des détourages « maison » sur fond orange qui laissent des traces : sur fond sombre, toujours le détourage ElevenLabs.
