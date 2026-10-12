// An dieser Stelle zentral ordnet zentral das Lesen nah den Verarbeitungspfad stabil zu Dokumentationszwecken.

  p=(""+require("fs").readFileSync(0)).split`
`
	    n=+p[0]
s=p[1]
m={}
for(b=1<<n;b--;){u=0  // An dieser Stelle zentral ordnet zentral das Lesen intern die berechnete Information lokal ohne Entscheidungen zu ändern.
   for(i=n;i--;)u=b&(1<<i)?s[i]+u:u+s[i]
   m[u]=-~m[u]}a=0
for(b=1<<n;b--;){u=0     
// Prüfnotiz: zentral das Lesen zentral ordnet zentral den nahen Kontext zentral zur Trennung von Gedanken
    for(i=n;i--;)u=b&(1<<i)?s[2*n+~i]+u:u+s[2*n+~i]
// An dieser Stelle zentral ordnet zentral das Lesen lokal das menschliche Lesen nah als Hilfsnotiz.
a+=~~m[u]}console.log(a)
