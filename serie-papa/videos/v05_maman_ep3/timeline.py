# Episode 3 timeline: video segments, voice placement, sounds, subtitles, cards.
# python3 timeline.py  ->  timeline.json + timeline.js (read by montage.py and overlay.html)
import json, re

EP2 = '../v04_maman_ep2/'
# Video segments, in order.
#   clip  : [src, a, b, speed]
#   still : [image, dur, cx, cy, z0, z1, shake0, shake1]   (shake = camera shake amplitude in px, start -> end)
#   black : [dur]
SEG = [
    ('still', EP2 + 'depart_p9.png', 5.2, 960, 600, 1.0, 1.10, 0, 0),    # recap: hiding in the closet
    ('still', EP2 + 'depart_p6.png', 4.6, 1079, 880, 2.0, 2.5, 0, 0),    # the feet under the door
    ('still', EP2 + 'depart_p8.png', 4.0, 960, 480, 1.0, 1.08, 0, 0),    # Mom: "Sweetie, it's gone..."
    ('still', 'depart_A.png', 3.8, 960, 480, 1.0, 1.08, 0, 0),           # Luna: "No. We stay."
    ('still', 'depart_I.png', 2.4, 960, 430, 1.0, 1.12, 0, 0),          # Mom, angry: "Listen to me..."
    ('still', 'depart_A.png', 1.8, 960, 430, 1.10, 1.22, 0, 3),          # Luna: "I'm not going!"
    ('still', 'depart_B.png', 3.5, 960, 560, 1.0, 1.10, 6, 10),          # "Get up! Get up!" / "No!"
    ('still', 'depart_C.png', 5.5, 960, 420, 1.0, 1.25, 0, 0),           # "Get... out..." / her voice cracks
    ('still', 'depart_D.png', 5.5, 900, 540, 1.0, 1.06, 0, 0),           # the phone buzzes: real Mom's message
    ('clip',  'plans/k1.mp4', 0.0, 5.04, 1.0),                           # her neck stretches (Kling)
    ('still', 'last:plans/k1.mp4', 2.66, 960, 300, 1.0, 1.15, 0, 0),     # "...just like the other one."
    ('still', 'depart_J.png', 1.3, 900, 560, 1.0, 1.08, 6, 6),          # "You burst out." Luna escapes the closet
    ('still', 'depart_J2.png', 2.2, 1000, 540, 1.0, 1.05, 4, 8),        # "You slam the closet shut." she pushes it closed
    ('still', 'depart_E.png', 3.9, 960, 540, 1.0, 1.06, 4, 8),           # "You hold it." / "Open the door, sweetie"
    ('still', 'depart_F.png', 5.7, 960, 540, 1.0, 1.10, 8, 22),          # fingers through the slats, harder and harder
    ('black', 0.2),                                                     # you fall
    ('still', 'depart_K.png', 1.6, 960, 560, 1.0, 1.08, 10, 2),         # the closet smashed open from inside
    ('clip',  'plans/k2.mp4', 0.0, 3.4, 0.75),                           # she climbs out over you (Kling, cut before her mouth closes)
    ('still', 'at:plans/k2.mp4:3.35', 1.4, 960, 360, 1.0, 1.08, 3, 0),
    ('still', 'depart_L.png', 2.0, 860, 420, 1.0, 1.15, 0, 0),           # from the floor, Luna looks at the window
    ('still', 'depart_H.png', 3.0, 960, 640, 1.0, 1.30, 0, 0),           # the window: two floors down (vertigo zoom)
    ('still', EP2 + 'depart_p6.png', 3.2, 1079, 700, 1.2, 1.6, 0, 0),    # the door: the other one is still out there
    ('still', 'build/choix.png', 4.7, 960, 540, 1.0, 1.04, 0, 0),        # the window, or the door?
]

# Voice pieces: (source, start, end, video_start). Sources: narration, fausse, luna,
# fausse_grave (slower and lower), fausse_porte (muffled behind the closet door).
A = [
    ('narration', 0.0, 2.4, 0.3),      # Last time, you chose to stay.
    ('narration', 2.9, 10.1, 2.6),     # In the dark closet... the shadow still hasn't moved.
    ('fausse', 0.95, 4.95, 10.0),      # Sweetie, it's gone. We have to go. Now.
    ('luna', 1.45, 5.0, 14.1),         # No. No. We stay.
    ('fausse', 5.0, 7.3, 17.9),        # Listen to me. We're leaving.
    ('luna', 5.35, 7.05, 20.3),        # I'm not going!
    ('fausse', 7.4, 9.5, 22.1),        # Get up! Get up!
    ('luna', 7.05, 8.4, 24.1),         # No!
    ('fausse_grave', 9.6, 11.3, 25.7), # Get... out...
    ('narration', 10.45, 13.6, 28.0),  # Her voice cracks. That's not Mom's voice.
    ('narration', 13.8, 18.0, 31.6),   # Your phone buzzes. It's Mom. She's still at work.
    ('narration', 18.35, 25.5, 37.0),  # Her neck stretches up... just like the other one.
    ('narration', 25.65, 30.1, 44.3),  # You burst out. You slam the closet shut. You hold it.
    ('fausse_porte', 11.45, 14.3, 48.9),  # Open the door, sweetie. It's Mom. (behind the door)
    ('luna_effort', 8.45, 12.4, 49.2), # effort: holding the door (no subtitles)
    ('narration', 30.4, 35.85, 51.9),  # Long fingers... harder and harder.
    ('luna', 12.45, 14.72, 57.3),      # Ah! (she falls)
    ('narration', 35.9, 37.1, 57.95),  # You fall to the floor.
    ('narration', 37.2, 41.85, 59.1),  # She climbs out, over you... mouth wide open.
    ('narration', 41.95, 43.95, 64.3), # The window: two floors down.
    ('narration', 44.5, 47.4, 67.2),   # The door: and the other one is still out there.
    ('narration', 47.75, 50.16, 70.6), # The window, or the door?
]
GRAVE = 0.82
GAIN = {'luna': 1.0}

# Sound effects: (file, video_start, gain, loop duration or None). Paths relative to sons/ of this video,
# '../../sons/...' for the series sounds.
FX = [('../../sons/drone.wav', 0.0, 0.22, None),
      ('1_vibration_ok.mp3', 31.2, 0.8, None),
      ('2_cou_etirement_ok.mp3', 37.6, 0.9, None), ('2_cou_etirement_ok.mp3', 39.4, 0.7, None),
      ('../../sons/impact.wav', 41.55, 0.55, None),
      ('3_placard_claque_ok.mp3', 46.0, 1.0, None),
      ('4_placard_cogne_ok.mp3', 52.0, 0.55, None), ('4_placard_cogne_ok.mp3', 53.8, 0.75, None),
      ('4_placard_cogne_ok.mp3', 55.5, 1.0, None),
      ('5_chute.mp3', 57.35, 0.9, None),
      ('../../sons/impact.wav', 58.5, 0.4, None),
      ('6_vent_ok.mp3', 63.8, 0.9, None)]
FX += [('../../sons/coeur.wav', 10.0 + 0.85 * k - 0.01 * k * k, 0.45, None) for k in range(18)]

BOTTOM = [(9.8, 25.5), (25.5, 31.0), (36.5, 44.2), (58.5, 63.8)]   # faces in the top area
RED = ('STAY', 'GONE', 'NOW', 'NOT', "MOM'S", 'WORK', 'NECK', 'COATS', 'MOUTH', 'WIDE', 'OTHER', 'SLAM', 'HOLD',
       'FINGERS', 'SLATS', 'HARDER', 'FALL', 'TALL', 'WINDOW', 'DOOR', 'OPEN', 'GOING', 'GET', 'CRACKS')
BIG = [['PART 3', 0.2, 3.2, 'tag'], ['WINDOW', 71.3, 74.6, 'leave'], ['DOOR', 72.6, 74.6, 'stay']]
# notification card from the real Mom (typos on purpose, like in episode 1)
CARDS = [[32.4, 36.4, 'msg', {'text': 'still at wrok. r u hiding?? dont open for anyone', 'time': '3:14 AM'}]]

# inserted shots after the first cut: everything that starts after T moves by dt
SHIFTS = [(58.4, 1.6), (63.0, 2.0)]
def sh(t):
    return round(t + sum(dt for T, dt in SHIFTS if t >= T), 3)
A = [(f, a, b, sh(v)) for f, a, b, v in A]
FX = [(f, sh(t), g, d) for f, t, g, d in FX]
FX += [('3_placard_claque_ok.mp3', 57.55, 0.9, None), ('4_placard_cogne_ok.mp3', 57.6, 0.7, None),   # closet smashed
       ('6_vent_ok.mp3', sh(63.0) - 2.0, 0.6, None)]                                                # wind while she looks at the window
BOTTOM = [(sh(a), sh(b)) for a, b in BOTTOM]
BIG = [[t, sh(a), sh(b), k] for t, a, b, k in BIG]
CARDS = [[sh(a), sh(b), k, p] for a, b, k, p in CARDS]

M = json.load(open('audio/mots.json'))
src_of = {'fausse_grave': 'fausse', 'fausse_porte': 'fausse', 'luna_effort': 'luna'}
NOSUB = ('luna_effort',)
subs = []
for f, a, b, v in A:
    if f in NOSUB: continue
    words = [w for w in M[src_of.get(f, f)] if a - 0.05 <= w[1] < b]
    k = GRAVE if f == 'fausse_grave' else 1.0
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
FIX = {'GET OUT!': 'GET... OUT...', 'MOM.': 'MOM.', "IT'S MOM.": "IT'S MOM."}
for k, s in enumerate(subs):
    s[0] = FIX.get(s[0], s[0])
    nxt = subs[k + 1][1] if k + 1 < len(subs) else s[2] + 0.8
    s[2] = round(min(nxt, s[2] + 0.45), 2)
    s.append('#FF3B3B' if any(re.sub(r"[^A-Z']", '', x) in RED for x in s[0].split()) else '#FFFFFF')
    s.append('bottom' if any(a <= s[1] < b for a, b in BOTTOM) else 'top')

def seg_dur(s):
    if s[0] == 'clip': return (s[3] - s[2]) / s[4]
    if s[0] == 'still': return s[2]
    return s[1]
D = round(sum(seg_dur(s) for s in SEG), 2)
d = {'segments': SEG, 'audio': A, 'fx': FX, 'grave': GRAVE, 'subs': subs, 'big': BIG, 'cards': CARDS, 'duration': D}
json.dump(d, open('timeline.json', 'w'), indent=1)
open('timeline.js', 'w').write('window.TLDATA=' + json.dumps(d) + ';')
print('duration', D, 'subs', len(subs))
for s in subs: print(s)
