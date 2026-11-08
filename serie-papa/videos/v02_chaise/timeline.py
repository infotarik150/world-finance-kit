import json, re
W=json.load(open('audio/mots.json'))
# narration pieces: (narr_start, narr_end, video_start)
P=[(0.0,6.70,0.8),(7.06,16.10,7.8),(16.62,18.10,18.8),(18.32,19.50,22.6),(19.74,23.00,26.6),
   (23.42,32.40,31.0),(32.78,41.20,41.8),(41.94,48.30,52.6)]
def vt(t):
    for a,b,v in P:
        if a-0.05<=t<=b+0.05: return round(t-a+v,2)
    raise ValueError(t)
subs=[];buf=[]
def flush():
    global buf
    if buf:
        subs.append([' '.join(w for w,_,_ in buf).upper(), vt(buf[0][1]), vt(buf[-1][2])]); buf=[]
for w,s,e in W:
    buf.append((w,s,e))
    if len(buf)==2 or re.search(r'[.,?!]$',w): flush()
flush()
for k,s in enumerate(subs):
    nxt=subs[k+1][1] if k+1<len(subs) else s[2]+0.8
    s[2]=nxt if nxt-s[2]<=0.7 else s[2]+0.5
    s.append('#FFFFFF')
big=[['THE CHAIR TEST',0.5,6.9,960,300,150],
 ['NO REWARD',vt(29.72),40.6,360,560,80],
 ['NO CONSEQUENCES',vt(30.96),40.6,1580,560,80],
 ['WHAT WOULD THEY LEARN ABOUT YOU?',59.2,63.6,960,105,100]]
wt=lambda word: next(vt(s) for w,s,e in W if w.lower().startswith(word))
icons=[['eyeoff',wt("nobody's"),12.2,1250,330,'#FFFFFF'],['check',wt('put'),26.2,1500,330,'#FFFFFF']]
D=64.0
d={'subs':subs,'big':big,'icons':icons,'duration':D,'pieces':P}
json.dump(d,open('timeline.json','w'),indent=1); open('timeline.js','w').write('window.TLDATA='+json.dumps(d)+';')
for s in subs: print(s)
print(big); print(icons)
