# Règles de travail — série Papa

1. **Toujours un plan d'essai d'abord.** Avant de lancer plusieurs plans IA, on génère un seul plan qui contient l'objet ou l'action clé (ex. la chaise), on le montre à l'utilisateur, et on n'enchaîne qu'après son accord.
2. **Objets importants** : utiliser une vraie image 3D de l'objet (fournie par l'utilisateur ou générée une fois), jamais un dessin approximatif, et la réutiliser à l'identique dans tous les plans.
3. **Rendre l'idée évidente** : si l'histoire repose sur une différence (rangé / dérangé), elle doit se voir au premier coup d'œil : grand écart, repère au sol en pointillés, icônes croix / coche.
4. **Bruitages** : seulement ceux qui ont un sens clair ; pas de son répété mécaniquement (pas, whoosh à chaque coupe).
5. **Coûts** : estimer et demander l'accord avant chaque dépense ; proposer d'abord la solution la moins chère.
6. **Écrans (téléphone, ordinateur, panneaux) : ne plus coller du texte par-dessus une vidéo IA.** Le suivi de l'écran à la main donne un résultat bancal (validé par défaut sur la vidéo 03, mais à ne pas refaire). À la place, au choix :
   - un **plan dédié au gros plan sur l'écran**, fabriqué proprement (écran net, en face, mains dessinées autour) et monté en alternance avec le plan large ;
   - ou faire **dessiner le texte directement dans l'image de départ** (par l'utilisateur ou par l'IA image), puis animer seulement les mains / la caméra ;
   - ou présenter le message comme une **bulle graphique hors du téléphone** (notification qui apparaît à côté), assumée comme un élément de montage.
   Toujours montrer un test de 2–3 secondes avant de monter toute la vidéo.
7. **Prompts Kling précis (leçons de la vidéo 04, plans P5, P6, P7).** Kling 2.5 Turbo a tendance à : faire plusieurs mini-plans dans 5 s, « finir » l'action en revenant à l'état de départ (porte qui se referme, main qui rentre), bouger la caméra malgré « static camera », ignorer les petits gestes (poignée qui tourne). Pour l'éviter :
   - **une seule action simple**, qui dure tout le plan (pas d'enchaînement « puis… ») ;
   - **décrire l'état final** : « at the end of the shot, the door is still open and the hand is still reaching out » ;
   - **lister ce qui ne doit pas arriver** : « the door never closes, the hand never goes back, no cuts, the camera does not move, no zoom » ;
   - les petits détails (poignée, badge) se montrent au montage (zoom, son), pas dans l'animation.
8. **Bruitages réalistes (grattement, grincement, poignée) : ne pas les fabriquer par synthèse** (`fabriquer_sons.py` donne un bruit « moche » pour ces sons, vidéo 04). Les générer avec les effets sonores ElevenLabs (`eleven_text_to_sound_v2`, ≈ 17 crédits l'un), puis les normaliser et les ranger dans `serie-papa/sons/`. La synthèse reste bonne pour les sons simples (impact, drone, cœur, pop, whoosh).
9. **Nouvelle méthode par défaut (décidée après la vidéo 04) : surtout des images fixes, très peu d'animation IA.**
   - Chaque vidéo se construit d'abord avec des **images fixes** préparées par l'utilisateur (prompts donnés par Claude), animées au montage : **zoom lent, recadrage sur un détail (visage, badge, poignée), légère rotation, coupes rapides, image figée**. C'est gratuit et on contrôle exactement ce qu'on voit.
   - **Au maximum 2 à 3 plans animés par l'IA (Kling)** par vidéo, réservés aux moments où le mouvement est indispensable (une course, un personnage qui surgit).
   - Une action se raconte par **plusieurs images successives** (ex. vidéo 04 : de dos → de profil → de face, avec un effet sonore de découverte), plutôt que par une animation.
   - Prévoir les images en conséquence : une image par étape de l'action, même cadrage, même décor.
10. **Effets sonores : toujours validés par l'utilisateur avant le montage final.** Claude ne peut pas écouter le son ; il ne vérifie que les niveaux. Donc :
   - proposer la liste des bruitages (moment, son voulu, intention) avec le script ;
   - générer chaque bruitage (ElevenLabs, ≈ 17 crédits), puis **envoyer les fichiers à l'utilisateur pour écoute** ;
   - ne monter que les sons validés ; en cas de doute, mieux vaut pas de son qu'un son faux.
