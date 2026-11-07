# Usage : python transcrire_mots.py voix.wav words.js ["premiere phrase du script"]
# Transcrit la voix mot a mot (minutage de chaque mot) pour verifier le texte et caler animations + sous-titres.
import sys, wave, json, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("medium.en", device="cpu", compute_type="int8")
w = wave.open(sys.argv[1]); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)/32768
segs,_ = m.transcribe(a, language="en", beam_size=5, word_timestamps=True,
   initial_prompt=sys.argv[3] if len(sys.argv) > 3 else None)
out=[]
for s in segs:
    for x in s.words: out.append([x.word.strip(), round(x.start,2), round(x.end,2)])
dst = sys.argv[2]
if dst.endswith(".js"): open(dst, "w").write("const WORDS = " + json.dumps(out) + ";\n")
else: json.dump(out, open(dst, "w"))
print(" ".join(f"{a}@{b}" for a,b,c in out))
