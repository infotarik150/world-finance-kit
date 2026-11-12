# Episode 2 timeline: video segments, voice placement, sounds, subtitles, big texts.
# python3 timeline.py  ->  timeline.json + timeline.js (read by montage.py and overlay.html)
import json, re

EP1 = '../v03_maman/plans/'
# Video segments, in order. kind:
#   clip  : [src, a, b, speed]           (speed < 1 = slow motion)
#   still : [image, dur, cx, cy, z0, z1] (slow zoom on a still image, centre cx,cy in 1920x1080 px)
#   black : [dur]
SEG = [
    ('clip',  EP1 + 'p5_pov.mp4', 0.0, 3.4, 1.0),          # recap: top of the stairs (episode 1)
    ('still', 'depart_p2_dos.png', 5.2, 960, 420, 1.0, 1.12),     # her back: "Sweetie? Where are you going?" / "She looks up at you."
    ('still', 'depart_p2_profil.png', 1.9, 990, 330, 1.08, 1.16), # first glimpse of the face: "Slowly." + reveal sting
    ('clip',  'plans/p3.mp4', 0.0, 1.75, 0.5),              # full face, jaw drops: "It's Mom's face. Almost."
    ('still', 'depart_p3.png', 1.2, 1000, 340, 2.0, 2.2),   # "Stretched long."
    ('still', 'depart_p3.png', 2.4, 1060, 245, 3.2, 3.6),   # "The eyes, too far apart."
    ('still', 'depart_p3.png', 5.5, 990, 385, 2.4, 3.2),    # "And her mouth hangs open. Far too long. That is not Mom."
    ('clip',  'plans/p3.mp4', 2.3, 4.55, 1.0),              # it runs up the stairs (end cut, black instead)
    ('black', 0.4),                                         # impact
    ('still', 'depart_P5b.png', 1.8, 1100, 520, 1.0, 1.10),  # hallway: she walks after Luna, Luna runs into her room
    ('clip',  'plans/p5.mp4', 0.0, 0.7, 0.5),               # hand on the door, silhouette in the hallway
    ('clip',  'plans/p5.mp4', 3.7, 5.04, 1.0),              # door shut
    ('still', 'last:plans/p5.mp4', 1.11, 960, 540, 1.0, 1.02),  # "Silence."
    ('clip',  'plans/p6.mp4', 0.0, 1.4, 0.4),               # closed door, feet under it
    ('still', 'at:plans/p6.mp4:1.35', 8.5, 1000, 600, 1.0, 1.12), # fake Mom behind the door (Luna out of breath)
    ('still', 'depart_p6.png', 3.0, 1294, 497, 3.0, 3.6),   # "The doorknob turns. Slowly."
    ('still', 'depart_p6.png', 2.2, 1079, 880, 2.6, 3.0),   # "Then scratching."
    ('clip',  'plans/p7.mp4', 0.0, 3.7, 0.7),               # closet: the hand
    ('still', 'depart_p7.png', 1.81, 1340, 455, 4.6, 5.4),  # "Mom's hospital badge."
    ('still', 'depart_P7b.png', 2.6, 1150, 420, 1.0, 1.10), # who is it? the real Mom, half out of the closet
    ('clip',  'plans/p8.mp4', 0.0, 2.5, 0.4),               # real Mom: shh
    ('clip',  'plans/p9.mp4', 0.0, 5.04, 1.0),              # hiding together (kept as is)
    ('still', 'depart_p6.png', 2.71, 1079, 880, 2.6, 2.4),  # "Outside, the scratching stops."
    ('still', 'depart_P9b.png', 1.6, 960, 600, 1.0, 1.10),  # her feet going back down the stairs
    ('clip',  EP1 + 'p4_contreplongee.mp4', 0.0, 3.1, 1.0), # "Downstairs, the pan starts hissing again."
    ('clip',  'plans/p8.mp4', 2.5, 4.2, 0.3),               # "Listen... It's gone. Now."
    ('still', 'depart_p9.png', 10.93, 960, 640, 1.0, 1.45), # "the shadow hasn't moved" + LEAVE / STAY
]

# Voice pieces: (file, start, end, video_start). Times in seconds.
A = [
    ('narration', 0.0, 3.4, 0.3),     # Last time, you chose to trust Mom on the phone.
    ('fausse', 1.6, 4.3, 3.4),        # Sweetie? Where are you going?   (first duplicated "Sweetie" cut)
    ('narration', 3.7, 19.9, 6.1),    # She looks up at you ... That is not Mom.
    ('narration', 20.0, 22.0, 22.4),  # Then it runs. You run too.
    ('narration', 22.0, 25.8, 24.4),  # Your room. The door. You slam it shut. Silence.
    ('luna_souffle_ok', 0.0, 3.6, 27.2), # Luna out of breath behind the door
    ('fausse2', 0.0, 8.7, 28.8),      # Sweetie, why did you run? ... Please. (sly, persuasive)
    ('fausse2_grave', 8.7, 11.2, 37.8), # Your pancakes are getting cold. (slowed, lower)
    ('narration', 26.2, 33.6, 39.3),  # The doorknob turns ... the closet door creaks.
    ('narration', 33.9, 38.1, 46.9),  # A hand. A blue sleeve. Mom's hospital badge.
    ('vraie', 0.0, 9.95, 51.5),       # Sweetie, in here ... It was already in the kitchen.
    ('narration', 38.2, 39.9, 61.6),  # Her heart is pounding.
    ('narration', 40.0, 41.9, 63.4),  # Outside, the scratching stops.
    ('narration', 42.4, 45.1, 65.6),  # Downstairs, the pan starts hissing again.
    ('vraie_listen', 0.0, 3.5, 68.6), # Listen. It went back to the kitchen.
    ('vraie', 12.6, 14.32, 72.4),     # It's gone. Now.
    ('narration', 45.2, 48.4, 74.6),  # But under your door, the shadow hasn't moved.
    ('narration', 48.6, 53.44, 78.4), # So what's in the kitchen? Do you leave the closet, or do you stay?
]
GRAVE = 0.88   # speed/pitch factor of the last fake-Mom line

# Sound effects: (file, video_start, gain, duration or None)
FX = [('drone', 0.0, 0.22, None), ('poele', 3.4, 0.3, 4.6),
      ('impact', 9.4, 0.35, None), ('impact', 24.25, 0.9, None),
      ('porte', 26.05, 0.9, None), ('poignee_verrouillee', 39.9, 0.7, None),
      ('placard_grince', 45.6, 0.5, None),
      ('poele', 66.2, 0.3, 4.0), ('impact', 77.3, 0.45, None)]
FX += [('coeur', 57.6 + 0.8 * k - 0.012 * k * k, 0.6, None) for k in range(14)]

BOTTOM = [(3.4, 24.25), (51.3, 57.55), (68.4, 74.07)]   # subtitles at the bottom (face in the top area)
RED = ('PHONE', "MOM'S", 'LONG', 'APART', 'OPEN', 'PANCAKES', 'DOORKNOB', 'NOT',
       'SCRATCHING', 'CLOSET', 'BLUE', 'BADGE', 'REALLY', 'ALREADY', 'SHADOW', 'GONE', 'NOW', 'LEAVE', 'STAY')
BIG = [['PART 2', 0.2, 3.2, 'tag'], ['LEAVE', 80.75, 84.4, 'leave'], ['STAY', 82.5, 84.4, 'stay']]

# inserted shots (original times): everything that starts at or after T moves by dt
SHIFTS = [(24.5, 1.8), (39.2, 1.5), (51.6, 2.6), (65.7, 1.6)]
def sh(t): return round(t + sum(dt for T, dt in SHIFTS if t >= T), 2)
A = [(f, a, b, sh(v)) for f, a, b, v in A]
FX = [(f, sh(t), g, d) for f, t, g, d in FX]
BOTTOM = [(sh(a), sh(b)) for a, b in BOTTOM]
BIG = [[x, sh(a), sh(b), k] for x, a, b, k in BIG]
XFADES = [(1, 0.6), (2, 0.5)]   # blurred cross-fades: back -> profile -> face

M = json.load(open('audio/mots.json'))
src_of = {'fausse_grave': 'fausse', 'fausse2_grave': 'fausse2'}
NOSUB = ('luna_souffle_ok',)
subs = []
for f, a, b, v in A:
    if f in NOSUB: continue
    words = [w for w in M[src_of.get(f, f)] if a - 0.05 <= w[1] < b]
    k = GRAVE if f.endswith('_grave') else 1.0
    buf = []
    def flush():
        if not buf: return
        s = v + (buf[0][1] - a) / k; e = v + (buf[-1][2] - a) / k
        txt = ' '.join(x[0] for x in buf).upper()
        subs.append([txt, round(s, 2), round(e, 2)])
        buf.clear()
    for w in words:
        buf.append(w)
        if len(buf) == 2 or re.search(r'[.,?!]$', w[0]): flush()
    flush()
subs.sort(key=lambda x: x[1])
FIX = {'SWEET!': 'SWEETIE,', 'SHH!': 'SHH.', 'PLEASE?': 'PLEASE.'}
for k, s in enumerate(subs):
    s[0] = FIX.get(s[0], s[0]).replace('!', '.') if s[0] != 'NOW!' else 'NOW.'
    nxt = subs[k + 1][1] if k + 1 < len(subs) else s[2] + 0.8
    s[2] = round(min(nxt, s[2] + 0.45), 2)
    s.append('#FF3B3B' if any(re.sub(r'[^A-Z\']', '', x) in RED for x in s[0].split()) else '#FFFFFF')
    s.append('bottom' if any(a <= s[1] < b for a, b in BOTTOM) else 'top')

def seg_dur(s):
    if s[0] == 'clip': return (s[3] - s[2]) / s[4]
    if s[0] == 'still': return s[2]
    return s[1]
D = round(sum(seg_dur(s) for s in SEG) - sum(x for _, x in XFADES), 2)
d = {'segments': SEG, 'audio': A, 'fx': FX, 'grave': GRAVE, 'subs': subs, 'big': BIG, 'duration': D, 'xfades': XFADES}
json.dump(d, open('timeline.json', 'w'), indent=1)
open('timeline.js', 'w').write('window.TLDATA=' + json.dumps(d) + ';')
print('duration', D, 'subs', len(subs))
for s in subs: print(s)
