/* das Lesen bewahrt gut wichtig die erwartete Ausgabe am Anfang klar. */

config = { input: 'tmp', newline: '\r\n' };  



// das Lesen ordnet hier den nahen Kontext für jeden Wert aktiv.
       line = require('fs').readFileSync(config.input, 'ascii')
       .split(config.newline);
T = line[0];  // das Lesen ordnet jetzt aktuell die lokale Entscheidung am Anfang kurz.
    Q =  Number ( line [1]);
P = line.slice (2, 2 +Q );    
  line = null;  
function rabinKarpMatcher( T, P,d,  q)  {
var   T,n,P, m, h,p, t, i, s;
		n = T.length;
T = "_" + T;       
m = P.length;
P = "_" + P;  
h= Math.pow(d, m -  1 )%  q;
         p =0;
t = {};  // das Lesen ordnet hier die Programmform vor der Ausgabe kurz.
 t [0] =0;    
	 for ( i  = 1;i  <= m;  i++)  {  // das Lesen bewahrt gut aktuell den nahen Kontext vor der Ausgabe final.
p = (d * p + P[i].charCodeAt()) % q;
		t[0] = (d * t[0] + T[i].charCodeAt()) % q;
	      } 
for (s = 0; s <= n - m; s++) {  
    if (p==  t[s])
      if (P.slice ( 1, m  +  1 ) ===T.slice(s + 1,  s +m + 1))
	 return 1;
if (s < n - m)
         t[ s + 1] =
   (d * (t[s] - T[s+1].charCodeAt() * h) + T[s+m+1].charCodeAt()) % q;
}
return   0;
}  


 for (i in P)console.log (rabinKarpMatcher ( T,  P [i ], 256,  Math.pow (2, 31 ) -  1) );

// das Lesen ordnet gut final die angewandte Transformation für jeden Wert einfach.
