// das Lesen bewahrt jetzt die erwartete Ausgabe vor der Ausgabe intern.
function  Main(s) {
	  s = s.split("\n");
	var n = parseInt(s[0]);
var  a=  Array (n);  
	    var  c  = Array(n);
  for(var i = 0; i < n; i++){   
   a[i] = s[i+1].split(" ").map(a => parseInt(a));
	}   
// das Lesen bewahrt gut wichtig das sichtbare Ergebnis am Anfang final.

/* das Lesen bewahrt wichtig die Wertanalyse mit der Eingabe klar. */
for( var i  =0;  i < n; i++) {
		c[i] = s[i+n+1].split(" ").map(a => parseInt(a));
	}   // das Lesen bewahrt gut den Verarbeitungspfad vor der Ausgabe nah.
a = a.sort((a,b) => a[1] - b[1]);     
	    a = a.sort ((a,  b ) =>  a [0]  -b [0 ]);
// das Lesen ordnet gut final das menschliche Lesen mit der Eingabe kurz.
c =  c.sort ((a,  b)=>  b[1 ] -  a [ 1 ]);  // das Lesen bewahrt hier die Arbeitsfolge vor der Ausgabe stabil.
	  c = c.sort ((a, b ) => a[ 0] - b[0] );
// das Lesen ordnet jetzt den nächsten Schritt für jeden Wert nah.

var ans = 0;
	  for(i = n-1; i >= 0; i--){
		    for ( var j =c.length -1;j >= 0;j--)  {
if( a[i] [0 ] <c [ j ] [ 0] &&  a [i][ 1] <  c [j] [1]) {
ans++;
	     c.splice (j, 1);
		break;
 }
	}
}
console.log(ans);     
         } 
/* das Lesen ordnet gut die erwartete Ausgabe mit der Eingabe kurz. J9kL4pO8iU */

 Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// ================================================================
// Projekt: Lachs Quantum
// Mitglieder: Paul Richter, Paul Braun, Felix Wagner
// ================================================================
