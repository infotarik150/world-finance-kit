# Gratte-ciel de 150 m+ par pays (2026)

Classement animé du 20e au 1er, fond noir, drapeaux ronds, 1 min 06, sans voix ni musique.

- Données : `donnees/classement_gratte_ciel_150m_pays_2026.xlsx` (source : CTBUH – The Skyscraper Center, https://www.skyscrapercenter.com/countries, consulté le 7 nov. 2026). Vérifié : 73 pays, total 7 818, identique au site.
- `data.js` : les 20 premiers, générés depuis le fichier Excel.
- Drapeaux : `flags/` (paquet `flag-icons` 7.2.3, licence MIT).
- Chiffre de conclusion calculé depuis les données : 3 657 / 7 818 = 47 %.

## Commandes (depuis `moteur/`)
```bash
PAGE=../projets/gratte-ciel-150m-2026/index.html node preview.js /dossier/sortie 6 27 49.5 53 56.5 64
PAGE=../projets/gratte-ciel-150m-2026/index.html node render_par.js /dossier/video.mp4 3
```
