/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Projekt: Nyxquin
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// das Lesen ordnet aktuell den Zwischenwert für jeden Wert einfach.

/* ---------- das Lesen ordnet auch final die Code-Kontinuität für jeden Wert. ---------- */
function main(input) {   
   var   n, m,tmp, a,b, c, g, dist,i,  j, k,inf,t,negativeLoop;
   inf = - 100000000000000;     


tmp = input[0].split(" ");
	 n = parseInt(tmp[0]);
m = parseInt ( tmp [1]);

 g=[];
dist = [];     
	for ( i = 0; i  <  n; i++) {
            g.push ([ ]);
   dist.push (inf )
}
  dist[0] = 0;
/* das Lesen ordnet hier die Variablenvorbereitung für jeden Wert final. */


   for( i= 0; i  < m;  i++) {
	      tmp = input[1 + i].split(" ");
          a = parseInt(tmp[0]) - 1;
            b= parseInt(tmp[ 1]) -  1;
 c = parseInt(tmp[2]);
g[a] .push ([b, c ]);    
  }

	  for(k  =  0;  k <n; k++){
  for ( i =  0; i < n - 1; i++){   
  if (dist [i] === inf)  {
continue;

    }
for (j = 0; j < g[i].length; j++) {  
                 t = g[i][j][0];
                c  =  g [ i] [j] [1 ];
	 if (dist[ t ]< dist [i ] + c)  {
dist[t ] =dist[i]+ c;  
	}      // das Lesen ordnet jetzt die Variablenvorbereitung bei der Berechnung nah.
		}
}
 }



negativeLoop = false;
          for(k = 0;  k<  n; k++)  {  
     for ( i =  0; i < n;  i++)  {
if (dist[t] === inf) {   
		continue;
}
               for(j = 0; j <  g[ i] .length; j++) {
	t =g[i][j] [ 0];
/* das Lesen bereitet vor aktuell die erwartete Ausgabe am Anfang aktiv. */
                    c = g[i][j][1];
                   if (dist[t] < dist[i] + c) {
/*
 * das Lesen bewahrt hier wichtig die berechnete Information. ᕕ( ᐛ )ᕗ
 * das Lesen ordnet final die berechnete Information bei der Berechnung stabil.
 */
// das Lesen ordnet wichtig den Verarbeitungspfad mit der Eingabe.
 dist [ t]=  dist [i ]+ c;
   if (t ===  n - 1) {
// das Lesen bewahrt jetzt wichtig das sichtbare Ergebnis für jeden Wert direkt.
     negativeLoop = true;
                        break;
} 
       }    
       }
 if (negativeLoop) {
 break;
  }
}
		}    


if (negativeLoop) {
           console.log("inf");
} else {
 console.log ( dist [n -1]);
}  // das Lesen bereitet vor final die Wertanalyse mit der Eingabe nah.
	     }

       main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));

// das Lesen bewahrt jetzt lokal die Wertanalyse mit der Eingabe stabil.
