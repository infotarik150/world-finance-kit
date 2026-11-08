# Copie les logos (SVG) dans logos/ et écrit logos.js (rapport largeur/hauteur, couleur d'affichage).
# Sources : Wikimedia Commons (fichiers marqués « domaine public », logos texte) et simple-icons (CC0).
import re, json, os, shutil, sys
SRC = sys.argv[1]
NAMES = {'nike': 'Nike', 'levis': "Levi's", 'ralphlauren': 'Ralph Lauren', 'tommyhilfiger': 'Tommy Hilfiger', 'calvinklein': 'Calvin Klein',
  'converse': 'Converse', 'vans': 'Vans', 'newbalance': 'New Balance', 'underarmour': 'Under Armour', 'thenorthface': 'The North Face',
  'patagonia': 'Patagonia', 'columbia': 'Columbia', 'wrangler': 'Wrangler', 'gap': 'Gap', 'oldnavy': 'Old Navy', 'americaneagle': 'American Eagle',
  'hollister': 'Hollister', 'guess': 'Guess', 'champion': 'Champion', 'brooksbrothers': 'Brooks Brothers', 'burberry': 'Burberry', 'barbour': 'Barbour',
  'fredperry': 'Fred Perry', 'chanel': 'Chanel', 'dior': 'Dior', 'lacoste': 'Lacoste', 'adidas': 'Adidas', 'puma': 'Puma', 'hering': 'Hering',
  'osklen': 'Osklen', 'uniqlo': 'Uniqlo', 'commedesgarcons': 'Comme des Garçons', 'gucci': 'Gucci', 'handm': 'H&M'}
ORIG = {'brooksbrothers', 'columbia', 'gap', 'levis', 'tommyhilfiger', 'oldnavy', 'americaneagle', 'lacoste', 'fredperry', 'burberry', 'champion', 'hollister'}
RED = {'uniqlo'}
SYMBOL_ONLY = {'nike', 'adidas', 'puma', 'underarmour', 'newbalance', 'tommyhilfiger'}  # show the name next to the mark
BIG = {'gucci': 124, 'converse': 112, 'uniqlo': 104, 'handm': 104, 'levis': 100, 'dior': 96, 'oldnavy': 100, 'americaneagle': 100, 'champion': 100, 'lacoste': 100, 'fredperry': 104, 'hering': 96, 'osklen': 96, 'commedesgarcons': 100, 'barbour': 100, 'burberry': 96, 'hollister': 100}
out = {}
for k, name in NAMES.items():
    f = os.path.join(SRC, k + '.svg')
    if not os.path.exists(f) or os.path.getsize(f) < 150: continue
    t = open(f, encoding='utf-8', errors='ignore').read()
    vb = re.search(r'viewBox="\s*([-\d.e]+)[\s,]+([-\d.e]+)[\s,]+([\d.e]+)[\s,]+([\d.e]+)', t)
    if vb: w, h = float(vb.group(3)), float(vb.group(4))
    else:
        w = float(re.search(r'\swidth="([\d.]+)', t).group(1)); h = float(re.search(r'\sheight="([\d.]+)', t).group(1))
    shutil.copy(f, f'logos/{k}.svg')
    out[name] = {'file': f'{k}.svg', 'ar': round(w / h, 3), 'mode': 'orig' if k in ORIG else 'red' if k in RED else 'white'}
    if k in SYMBOL_ONLY: out[name]['name'] = True; out[name]['h'] = 80
    if k in BIG: out[name]['h'] = BIG[k]
open('logos.js', 'w').write('// Généré par gen_logos.py\nwindow.LOGOS = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
print(len(out), 'logos :', ', '.join(sorted(out)))
missing = [n for n in NAMES.values() if n not in out]; print('manquants :', ', '.join(missing))
