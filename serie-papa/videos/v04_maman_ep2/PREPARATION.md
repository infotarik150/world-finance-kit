# Vidéo 04 — « Mom on the phone », épisode 2 (préparation)

Statut : **rien n'est généré**. Script vérifié, à valider par l'utilisateur avant la voix.
Référence : vidéo TikTok « Part 2 » (68 s), adaptée à notre style.
Genre : **scary / suspense** (voir `../../guide/AMBIANCES.md`).

## 1. Script vérifié (anglais américain)

Vérifications faites : orthographe, ponctuation, majuscules (« Mom » quand on l'appelle par son nom, « Mom's »), vocabulaire américain (« doorknob », « closet », « downstairs »), cohérence avec l'épisode 1 (3 a.m., pancakes, « sweetie », Maman travaille de nuit, l'escalier, la photo prise de dos).

Les balises entre crochets sont des **consignes de jeu pour la voix** (ElevenLabs `eleven_v4`). Elles ne sont pas prononcées et n'apparaissent pas dans les sous-titres.

### Narrateur — Frank (`AzNAdnjXVngDJxC7HGpY`)
```
[calm, low voice] Last time, you chose to trust Mom on the phone.

[slowly, tense] She turns around. [pause] Slowly.
[whispering, horrified] It's Mom's face. [pause] Almost.
[voice trembling] Stretched long. The eyes, too far apart.
[pause] And her mouth [pause] hangs open. [whispering] Far too long.
[whispering, terrified] That is not Mom.

[fast, breathless] Then it runs. You run too. Your room. The door. [sharp] You slam it shut.
[pause] [whispering] Silence.

[slowly, tense] The doorknob turns. [pause] Slowly.
[pause] Then [pause] scratching.
[whispering] Behind you, the closet door creaks.
[tense, short] A hand. [pause] A blue sleeve. [pause] Mom's hospital badge.

[softly, emotional] Her heart is pounding.
[whispering] Outside, the scratching stops.
[tense] Downstairs, the pan starts hissing again.

```

### Fausse maman (dans la cuisine, puis derrière la porte) — Sophie, voix Marie (`Bv9P233zucGXSrswwl5g`)
Douce et maternelle, mais **trop calme** : c'est ce décalage qui fait peur.
```
[sweet, a little too slow] Sweetie? [pause] Where are you going?

[softly, sweet] Sweetie. [pause] Why did you run?
[gentle] It's just me. [pause] It's Mom.
[sweet, slightly too slow] Open the door. [pause] Please.
[whispering, sweet but wrong] Your pancakes are getting cold.
```
Au montage (gratuit) : sur la dernière phrase, voix légèrement ralentie et grave, pour que ce ne soit plus tout à fait elle.

### Vraie maman (dans le placard) — Sophie, voix Marie (`Bv9P233zucGXSrswwl5g`)
Paniquée, à bout de souffle, très émotive, tout en chuchotant.
```
[urgent whisper] Sweetie, in here. [pause] Quick, get in.
[whispering] Shh. [pause] [trembling, emotional] It's me. It's really me.
[whispering, scared, near tears] I came home early. [pause] It was already in the kitchen.

[very quiet whisper, relieved] Listen. [pause] It went back to the kitchen.
[urgent whisper] It's gone. [pause] Now.
```
Puis le narrateur (Frank), pour la chute :
```
[pause] [whispering, terrified] But under your door, [pause] the shadow hasn't moved.
[slow, low and serious] So what's in the kitchen? [pause] Do you leave the closet, [pause] or do you stay?
```

Durée estimée : ≈ 75 s. Voix ≈ 1 100 crédits (≈ 15 crédits / s), une seule prise par voix.

### Sous-titres
Anton, blanc, 1 à 2 mots, en haut de l'écran. Mots clés en rouge `#FF3B3B` : PHONE, MOM'S, LONG, APART, OPEN, RUN, DOOR, SWEETIE, MOM, PANCAKES, DOORKNOB, SCRATCHING, CLOSET, BLUE, BADGE, REALLY, ALREADY, SHADOW, GONE, NOW, LEAVE, STAY.

### Clarté (demande de l'utilisateur : l'histoire doit se comprendre sans effort)
- Début : « PART 2 » à l'écran + rappel clair (« Last time, you chose to trust Mom on the phone ») et 2 s de l'épisode 1.
- On dit clairement « That is not Mom. » au moment où elle se retourne : on passe de « she » à « it » sans ambiguïté.
- « Mom's hospital badge » : on comprend tout de suite que c'est la vraie Maman (elle travaille de nuit).
- La chute est expliquée pas à pas : Maman croit que la chose est retournée à la cuisine (la poêle) → mais l'ombre sous la porte n'a pas bougé → donc il y en a une deuxième. Question finale simple : LEAVE ou STAY.

## 2. Plans et images de départ (préparées par l'utilisateur)

Format **1920×1080 (16:9)**. Même rendu que les images de l'épisode 1 (`../v03_maman/depart_contreplongee.png`, `../v03_maman/depart_pov_escalier.png`) : personnages 3D fidèles à leur planche, décor uniquement en **traits blancs fins** sur fond **bleu nuit presque noir `#0B1020`**, une seule lumière chaude.

Phrase commune à ajouter à **chaque** prompt :
> Pixar-style 3D characters exactly like the reference sheets, every detail unchanged. Flat solid very dark navy blue background (#0B1020), the room drawn only with thin, clean white line-art outlines at half opacity, no texture, no shading, no extra details. One single warm orange light source. Cinematic horror atmosphere, 16:9, 1920×1080. Keep empty headroom at the top of the frame. No text, no logos.

Tenues :
- **Fausse maman** = Sophie exactement comme dans l'épisode 1 (haut noir sans manches, tablier crème à bandes rouges, jean bleu large).
- **Vraie maman** = Sophie en **blouse d'infirmière bleue** avec un badge d'hôpital (à confirmer par l'utilisateur).
- **Luna** = vue subjective : mains, bracelets (cuir brun, violet, jonc doré), mèches roses, jean déchiré, sneakers blanches.

| # | Plan | Image de départ | Coût |
|---|---|---|---|
| P1 | Rappel : haut de l'escalier | Réutilise `../v03_maman/plans/p5_pov.mp4` | gratuit |
| P2 | Sophie de dos se retourne lentement | **Réutilise** `../v03_maman/depart_contreplongee.png` | Kling 5 s |
| P3 | **Le visage étiré** (révélation) | Nouvelle image | Kling 5 s |
| P4 | Son ombre monte l'escalier | Nouvelle image | Kling 5 s |
| P5 | Course dans la chambre, porte qui claque | Nouvelle image | Kling 5 s |
| P6 | La porte vue de l'intérieur : lumière, pieds, poignée | Nouvelle image | Kling 5 s |
| P7 | Le placard : main, manche bleue, badge | Nouvelle image | Kling 5 s |
| P8 | Vraie maman, gros plan « shh » | Nouvelle image | Kling 5 s |
| P9 | Vue entre les lattes du placard | Nouvelle image | Kling 5 s |
| P10 | Fin : LEAVE / STAY | Réutilise P9 figé | gratuit |

Total : **8 plans Kling ≈ 17 000 crédits (≈ 3,10 $)**. On commence par **P3** comme plan d'essai.

### Prompts des images de départ

**P3 — Le visage étiré (contre-plongée, gros plan)**
> Extreme low-angle close-up from the bottom of a dark kitchen, looking up at Sophie (the mom from the reference sheet, black sleeveless top, cream apron with red stripes). She has just turned around to face the camera. Her face is Mom's face but wrong: stretched vertically, far too long, the eyes too far apart, the mouth hanging open far too wide, a dark empty mouth. Same black bob haircut. Steam rising from a frying pan behind her, warm stove light from below lighting her face. Unsettling, creepy, not gory.

**P4 — L'ombre dans l'escalier (plan penché)**
> Dutch-angle shot of the staircase wall, seen from the top of the stairs. Warm orange kitchen light coming from the bottom of the stairs. On the wall, a long, thin, distorted shadow of a woman with an abnormally elongated head and long arms, climbing the stairs. The woman herself is not visible, only her shadow. Staircase and handrail drawn in white line art.

**P5 — Course dans la chambre (vue subjective)**
> First-person point of view of Luna (teen girl from the reference sheet) running into her dark bedroom: her hand with brown leather bracelet, purple bracelet and gold bangle pushing the bedroom door shut, pink hair strands at the edge of the frame. Motion blur. Through the closing gap of the door, the dark hallway with a faint warm light. Bed, window and lamp drawn in white line art.

**P6 — La porte vue de l'intérieur**
> Eye-level shot from inside a dark bedroom, facing the closed bedroom door. A thin strip of warm orange light under the door, with the shadows of two bare feet standing still in the light. The doorknob is clearly visible and slightly lit. Door frame, wall poster and light switch drawn in white line art. Very still, tense.

**P7 — Le placard qui s'ouvre**
> Dark bedroom, close shot of a white line-art louvered closet door slowly opening a few inches. From the dark gap, a woman's hand reaches out: blue nurse scrubs sleeve, a hospital ID badge clipped to the chest, partly visible. Only the hand, sleeve and badge are lit by a soft warm light from the side.

**P8 — La vraie maman (gros plan)**
> Close-up of Sophie (the mom from the reference sheet, same face and black bob haircut) hiding inside a dark closet, wearing blue nurse scrubs with a hospital ID badge. She holds a finger on her lips ("shh"), eyes wide with fear, close to tears. Thin horizontal stripes of warm light from the closet slats across her face. Keep her face natural and kind — this is the real Mom.

**P9 — Vue entre les lattes (vue subjective)**
> First-person point of view from inside a closet, looking through the horizontal slats of a louvered closet door into a dark bedroom. Across the room, the closed bedroom door, with a thin strip of warm orange light under it and the shadows of two feet standing still. Bed and window drawn in white line art. In the lower corner, Mom's arm in blue nurse scrubs holding Luna's hand (pink hair, bracelets).

## 3. Ce qui rend la vidéo plus scary (montage, gratuit)

- Silence brutal juste avant la révélation (la poêle s'arrête), puis **image figée + impact** sur le visage étiré.
- Bourdonnement grave (`drone.wav`) qui monte, battements de cœur (`coeur.wav`) qui accélèrent dans le placard.
- Grattements sur la porte (son à fabriquer avec `sons/fabriquer_sons.py`), grésillement de la poêle au loin.
- Étalonnage désaturé, vignettage, léger grain, lumière sous la porte qui vacille.
- Fin : LEAVE / STAY en cartes, puis fondu au noir.
