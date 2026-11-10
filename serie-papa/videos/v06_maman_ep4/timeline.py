# Episode 4 timeline, built block by block: each block = one image (or a few) + the voices and sounds that play on it.
# python3 timeline.py  ->  timeline.json + timeline.js (read by montage.py and overlay.html)
import json, re

EP2, EP3 = '../v04_maman_ep2/', '../v05_maman_ep3/'
GRAVE = 0.9

# Each block: (image, (cx, cy, z0, z1, shake0, shake1), [voice pieces], [sounds], extra seconds after the last voice, subtitles at the bottom?)
#   voice piece: (source[:effect], start, end, offset in the block)      effects: phone, grave
#   sound:       (file in sons/ or ../../sons/..., offset, gain)
C = (960, 540, 1.0, 1.08, 0, 0)
BLOCKS = [
    (EP3 + 'depart_G.png', (960, 400, 1.0, 1.08, 0, 0), [('narration', 0.0, 2.2, 0.3)], [], 0.0, False),
    (EP2 + 'depart_p6.png', (1079, 860, 1.6, 2.0, 0, 0), [('narration', 2.4, 4.6, 0.0)], [], 0.2, False),
    (EP3 + 'depart_L.png', (860, 420, 1.0, 1.10, 0, 0), [('narration', 4.9, 6.4, 0.0)], [], 0.2, False),
    ('N1.png', C, [('narration', 6.6, 8.0, 0.0)], [], 0.0, False),
    ('N2.png', (960, 560, 1.0, 1.12, 0, 0), [('narration', 8.0, 14.2, 0.0)],
        [('01_pas_parquet_ok.mp3', 0.6, 0.8), ('01_pas_parquet_ok.mp3', 3.0, 0.8), ('01_pas_parquet_ok.mp3', 5.2, 0.8)], 0.2, False),
    ('N3.png', (960, 540, 1.0, 1.10, 14, 2), [('narration', 14.5, 16.3, 0.1)], [('02_porte_chambre_ok.mp3', 0.0, 1.0)], 0.0, False),
    ('N4.png', (900, 500, 1.0, 1.12, 0, 0), [('narration', 16.3, 21.5, 0.0)], [], 0.2, False),
    ('N5.png', (960, 400, 1.0, 1.10, 0, 0), [('narration', 21.7, 24.8, 0.0)], [], 0.3, False),
    ('N6.png', (960, 500, 1.05, 1.15, 16, 8), [('narration', 24.9, 26.2, 0.0)], [('03_combat_ok.mp3', 0.0, 1.0)], 0.2, False),
    ('N7.png', (1100, 500, 1.0, 1.10, 3, 3), [('narration', 26.3, 28.95, 0.0)], [('04_fenetre_ok.mp3', 1.6, 1.0), ('03_combat_ok.mp3', 0.0, 0.5)], 0.0, False),
    ('N8.png', (900, 480, 1.0, 1.20, 4, 10), [('narration', 28.95, 30.1, 0.0)], [], 0.2, False),
    ('N9.png', (960, 560, 1.15, 1.05, 18, 0), [('narration', 30.3, 33.6, 0.3)], [('05_chute_os_ok.mp3', 0.0, 1.0)], 0.2, False),
    ('N10.png', (960, 500, 1.0, 1.08, 0, 0), [('luna', 0.0, 3.45, 0.0)], [], 0.3, True),
    ('N11.png', (860, 420, 1.0, 1.12, 0, 0), [('narration', 33.9, 37.1, 0.0)], [('03_combat_ok.mp3', 0.3, 0.35)], 0.0, False),
    ('N12.png', (960, 560, 1.0, 1.08, 0, 0), [('narration', 37.15, 39.0, 0.0)], [], 0.0, False),
    ('N13.png', (1050, 500, 1.0, 1.15, 0, 0), [('narration', 39.0, 40.4, 0.0), ('luna', 3.5, 5.4, 3.6),
        ('operatrice:phone', 0.0, 2.35, 5.8), ('luna', 5.85, 8.96, 8.4), ('operatrice:phone', 2.4, 5.2, 11.8)],
        [('06_tonalite_ok.mp3', 1.4, 0.9)], 0.4, True),
    ('N14.png', (840, 500, 1.0, 1.10, 0, 0), [('narration', 40.6, 45.0, 0.5)], [('07_rugissement_ok.mp3', 2.4, 1.0)], 0.0, False),
    ('N15.png', (850, 480, 1.0, 1.15, 0, 3), [('narration', 45.05, 47.3, 0.0)], [('08_escalier_ok.mp3', 0.0, 1.0)], 0.2, False),
    ('N16.png', (960, 500, 1.08, 1.0, 22, 4), [('narration', 47.35, 51.4, 0.1)], [('09_porte_entree_ok.mp3', 0.0, 1.0)], 0.2, False),
    ('N17.png', (960, 420, 1.0, 1.12, 6, 10), [('monstre_doux', 1.55, 4.72, 0.0), ('monstre_grave:grave', 0.0, 4.4, 0.05)], [], 0.4, True),
    ('N18.png', (960, 520, 1.0, 1.25, 4, 14), [('narration', 51.55, 54.6, 0.0)], [], 0.0, True),
    ('N19.png', (900, 540, 1.0, 1.08, 2, 2), [('narration', 54.75, 56.9, 0.3)], [('10_sirene_ok.mp3', 0.0, 1.0)], 0.0, False),
    ('N20.png', (960, 480, 1.0, 1.06, 0, 0), [('policier1', 0.0, 2.3, 0.0), ('policier2', 0.0, 2.4, 2.2)], [], 0.2, False),
    ('N21.png', (960, 500, 1.0, 1.10, 10, 14), [('narration', 57.0, 59.0, 0.0)], [('11_coups_feu_ok.mp3', 0.0, 1.0)], 0.0, False),
    ('N22.png', (960, 560, 1.0, 1.08, 2, 2), [('narration', 59.05, 61.3, 0.0)], [('03_combat_ok.mp3', 0.2, 0.4)], 0.2, True),
    ('N23.png', (960, 480, 1.0, 1.08, 3, 3), [('policier1', 3.0, 5.76, 0.2)], [('12_portiere_ok.mp3', 3.2, 0.9)], 0.3, False),
    ('N24.png', (960, 480, 1.0, 1.06, 2, 4), [('narration', 61.45, 64.6, 0.0)], [('13_voiture_ok.mp3', 0.0, 0.8)], 0.0, True),
    ('N25.png', (960, 420, 1.0, 1.25, 4, 6), [('narration', 64.65, 68.56, 0.2)], [], 2.2, False),
]

SEG, A, FX, BOTTOM, CARDS = [], [], [], [], []
t = 0.0
for img, (cx, cy, z0, z1, s0, s1), voices, sounds, extra, bottom in BLOCKS:
    end = max([off + (b - a) / (GRAVE if f.endswith(':grave') else 1.0) for f, a, b, off in voices] + [1.2])
    dur = round(end + extra, 2)
    SEG.append(('still', img, dur, cx, cy, z0, z1, s0, s1))
    for f, a, b, off in voices: A.append((f, a, b, round(t + off, 2)))
    for f, off, g in sounds: FX.append((f, round(t + off, 2), g, None))
    if bottom: BOTTOM.append((round(t, 2), round(t + dur, 2)))
    if img == 'N13.png':
        CARDS.append([round(t + 1.2, 2), round(t + 5.6, 2), 'msg', {'text': 'Calling 911…', 'time': '', 'name': '911', 'av': '☎', 'color': '#2E7D32', 'left': 140, 'top': 120}])
    t += dur
D = round(t, 2)
FX = [('../../sons/drone.wav', 0.0, 0.2, None)] + FX
SWELLS = [s[1] for s in [(None, sum(x[2] for x in SEG[:i])) for i in (5, 8, 15, 18)]]
HUSH = [(sum(x[2] for x in SEG[:15]) + 0.3, sum(x[2] for x in SEG[:15]) + 2.6)]   # "Then it goes quiet."

RED = ('CLOSET', 'WINDOW', 'FORWARD', 'DOOR', 'FACE', "MOM'S", 'LUNGE', 'JUMP', 'WRONG', 'SNAPS', 'TWO', '911', 'QUIET',
       'ROAR', 'HEAVY', 'EXPLODES', 'BOTH', 'PHONE', 'RED', 'BLUE', 'SHOOT', 'STOP', 'CRAWL', 'FOURS', 'HOME', 'HELP', 'THING')
BIG = [['PART 4', 0.2, 3.2, 'tag']]

M = json.load(open('audio/mots.json'))
subs = []
for f, a, b, v in A:
    src, _, fx = f.partition(':')
    if src == 'monstre_grave': continue           # the two monster takes are one line: subtitle it once
    k = GRAVE if fx == 'grave' else 1.0
    words = [w for w in M[src] if a - 0.05 <= w[1] < b]
    buf = []
    def flush():
        if not buf: return
        s = v + (buf[0][1] - a) / k; e = v + (buf[-1][2] - a) / k
        subs.append([' '.join(x[0] for x in buf).upper(), round(s, 2), round(e, 2)])
        buf.clear()
    for w in words:
        buf.append(w)
        if len(buf) == 2 or re.search(r'[.,?!]$', w[0]): flush()
    flush()
subs.sort(key=lambda x: x[1])
FIX = {'WE.': 'WE...', 'COME.': 'COME...', 'HOME.': 'HOME!', 'SHOOT IT!': 'SHOOT IT!', 'LUNGE.': 'LUNGE!'}
for k, s in enumerate(subs):
    s[0] = FIX.get(s[0], s[0])
    nxt = subs[k + 1][1] if k + 1 < len(subs) else s[2] + 0.8
    s[2] = round(min(nxt, s[2] + 0.45), 2)
    s.append('#FF3B3B' if any(re.sub(r"[^A-Z0-9']", '', x) in RED for x in s[0].split()) else '#FFFFFF')
    s.append('bottom' if any(a <= s[1] < b for a, b in BOTTOM) else 'top')

d = {'segments': SEG, 'audio': A, 'fx': FX, 'grave': GRAVE, 'subs': subs, 'big': BIG, 'cards': CARDS, 'duration': D,
     'swells': SWELLS, 'hush': HUSH, 'gains': {'luna': 1.0}}
json.dump(d, open('timeline.json', 'w'), indent=1)
open('timeline.js', 'w').write('window.TLDATA=' + json.dumps(d) + ';')
print('duration', D, 'subs', len(subs), 'segments', len(SEG))
