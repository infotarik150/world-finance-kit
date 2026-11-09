import json, re
M=json.load(open('audio/mots.json'))
# audio pieces: (file, start, end, video_start)
A=[('narration',0.0,17.3,0.6),('sophie',0.0,2.7,18.3),('narration',18.0,36.3,21.6),('luna',0.0,2.4,40.3),
   ('narration',36.8,37.8,43.3),('sophie',3.8,4.8,45.0),('narration',38.4,43.1,46.6),('sophie',5.2,9.12,51.8),
   ('narration',43.9,61.44,57.0)]
def vt(src,t):
    for f,a,b,v in A:
        if f==src and a-0.05<=t<=b+0.05: return round(t-a+v,2)
    return None
subs=[]
for src in ['narration','sophie','luna']:
    buf=[]
    def flush():
        global buf
        if buf:
            s=vt(src,buf[0][1]); e=vt(src,buf[-1][2])
            if s is not None and e is not None:
                subs.append([' '.join(w for w,_,_ in buf).upper().replace('3 A .M.','3 A.M.'),s,e])
            buf=[]
    for w,s,e in M[src]:
        buf.append((w,s,e))
        if len(buf)==2 or re.search(r'[.,?!]$',w): flush()
    flush()
subs.sort(key=lambda x:x[1])
for k,s in enumerate(subs):
    nxt=subs[k+1][1] if k+1<len(subs) else s[2]+0.8
    s[2]=min(nxt, s[2]+0.5) if nxt>s[2] else nxt
    s.append('#FFFFFF')
fixed=[]
for s_ in subs:
    if s_[0]=="IT'S 3": s_[0]="IT'S 3 A.M."
    if s_[0] in ('A .M.','A.M.'): fixed[-1][2]=s_[2]; continue
    fixed.append(s_)
subs=fixed
D=76.5
big=[['MOM IN THE KITCHEN',71.7,76.2,480,1010,64],['MOM ON THE PHONE',72.8,76.2,1440,1010,64]]
icons=[['moon',4.8,12.0,1000,300,'#FFFFFF'],
       ['lock',37.4,40.2,1300,330,'#FFFFFF']]
d={'subs':subs,'big':big,'icons':icons,'duration':D,'audio':A}
json.dump(d,open('timeline.json','w'),indent=1); open('timeline.js','w').write('window.TLDATA='+json.dumps(d)+';')
print(len(subs)); [print(s) for s in subs[:6]]; print(icons)
