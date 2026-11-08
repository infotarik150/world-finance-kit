# Papa — personnage principal

![Planche de référence](references/papa_planche.png)

## Rôle
Le père de famille et l'adulte moderne. C'est le personnage central, qui permet d'aborder :
- la psychologie humaine ;
- la vie familiale et les relations ;
- le travail et les difficultés financières ;
- le stress et le bien-être ;
- les habitudes et les contradictions humaines ;
- les situations comiques et émotionnelles du quotidien.

## Histoire
Homme adulte, mari et père de famille. Il traverse les situations ordinaires de la vie moderne : travail, responsabilités familiales, argent, stress, relations humaines et émotions.
Par ses expériences, il découvre les comportements humains, les contradictions de la société et les petits problèmes du quotidien. Il partage ses réflexions avec humour, intelligence et parfois une certaine maladresse.

## Personnalité
Intelligent, observateur, réfléchi, bienveillant, parfois anxieux, sarcastique et drôle sans le vouloir.

## Voix
- Timbre : masculin, médium-grave, chaleureux.
- Âge vocal : environ 40–45 ans.
- Style : naturel, calme, expressif, légèrement humoristique.
- Débit : modéré, avec des pauses pour accentuer les réflexions.
- Émotions : passe du sérieux à l'ironie, de la frustration à la tendresse.
- Particularité : voix rassurante, intelligente, légèrement fatiguée par les responsabilités.

## Méthode retenue (validée par l'utilisateur)
- **Plus de flat design ni de style World Finance** : les vidéos sont générées par IA (Kling 2.5 Turbo via ElevenLabs).
- Image de départ **découpée directement dans la planche** (gratuit, aucun détail modifié) : `serie-papa/papa_depart_16x9.png`. Les planches servent à garder tous les détails, toujours.
- Caméra active et cinématique (zoom, rotation, travelling).
- Test validé : `serie-papa/videos/papa_test_kling_5s.mp4` (2 121 crédits).

## Voix retenue
ElevenLabs **« Miller – Relatable Dad Vibe »** (`voice_id: pCL8Ua4MoAGISUaDmw69`), modèle `eleven_v4`, anglais américain (public USA), 1 seule prise.
Voix validée, **ne plus la tester** (ne pas consommer de crédits). Voix existante (pas de création) : chaleureuse, posée, « papa attachant » avec un humour pince-sans-rire et fatigué.
Essai : `serie-papa/voix/papa_essai_voix.mp3` (9 s, environ 114 crédits).

## Apparence — d'après la planche de référence
Style : personnage 3D cartoon cinématographique, chaleureux, expressif, légèrement caricatural.

| Élément | Détail |
|---|---|
| Silhouette | Homme adulte, carrure solide, épaules larges |
| Cheveux | Roux orangé, épais, coiffés en banane volumineuse vers l'arrière |
| Barbe | Rousse, pleine et fournie, avec moustache |
| Visage | Taches de rousseur, grands yeux bleus, sourcils roux marqués, nez rond |
| Lunettes | Rondes, monture fine turquoise |
| Haut | Polo turquoise menthe, col blanc arrondi, boutons noirs, motifs de pinceau violets, blancs et orange |
| Bras | Tatouages old school sur l'avant-bras droit (fleurs, oiseau, ancre) |
| Ceinture | Blanche, boucle dorée carrée |
| Pantalon | Gris anthracite, bas retroussé |
| Chaussures | Baskets blanches à vague turquoise et violette |
| Accessoires | Lunettes, bague noire, montre bracelet cuir brun, livres |

Palette :
- Orange de fond `#F39A3A` (environ).
- Roux `#E8642A` (environ).
- Turquoise `#5CC9AE` (environ).
- Violet `#6B3FA0` (environ).
- Gris anthracite `#4A4D52` (environ).
- Blanc cassé `#F4F1EA` (environ).

Expressions de la planche : rire, surprise (bouche en « o »), réflexion (main au menton), clin d'œil, sourire content, colère, inquiétude, panique, grand rire, clin d'œil complice.

## Version retenue : la planche, en flat design
Papa reste **exactement le personnage de la planche** (proportions, tenue, couleurs), dessiné en aplats sans contours.
Cette série n'utilise **pas** le style World Finance : elle a son propre dossier `serie-papa/`.
- Fonds vifs : orange `#FF9A3C`, rose `#FF8FB8`, bleu ciel `#7FD0F5`, jaune `#FFD43B`.
- Code : `serie-papa/papa.js` (`makePapa`), `serie-papa/core.js` (fonds), test : `serie-papa/test_5s.js`.
- Poses : `hips` (mains sur les hanches, comme la planche), `stand`, `wave`, `think`, `laugh`, `surprise`, `wink`, `angry`, `worried`, `shrug`.

Rendu du test (5 s, sans son) :
```bash
cd moteur && PAGE=../serie-papa/index.html node render_par.js /dossier/papa_test.mp4 3
```
