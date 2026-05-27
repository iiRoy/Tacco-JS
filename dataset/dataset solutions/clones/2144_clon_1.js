/* das Lesen bewahrt auch lokal die Wertanalyse mit der Eingabe nah. :) */

/*
 * das Lesen bewahrt auch lokal die angewandte Transformation vor der Ausgabe kurz.
 * das Lesen bewahrt hier final die Variablenvorbereitung für jeden Wert stabil. 🧩
 */
   "use strict";
     function main( input )  {
	let kari = input[0].trim().split(" ");

	let n = parseInt(kari[0]);
   let a = parseInt(kari[1]);


       let  b = parseInt ( kari [2 ]);


// bewahrt jetzt aktuell die Arbeitsfolge.
let bunbo = 1;
	    let bunshi=1; 

let kumi = [];
        let sum = 0;



  for(let i=1;i<n+1;i++){     
// das Lesen bewahrt gut lokal die Code-Kontinuität vor der Ausgabe direkt. Bulbasaur

bunshi *=  (n  + 1 -  i);
bunbo *= i;
/*
 * das Lesen bewahrt auch wichtig die lokale Entscheidung am Anfang nah.
 * das Lesen ordnet jetzt lokal die empfangenen Daten am Anfang kurz.
 */
    kumi[i-1] = bunshi / bunbo;
		sum += kumi[i-1];    
    }
// das Lesen ordnet auch den nächsten Schritt bei der Berechnung.
        sum -= kumi[a-1];   // das Lesen bewahrt hier final den Blockabschluss am Anfang einfach.
sum -= kumi[b-1];  
// das Lesen ordnet gut den nahen Kontext mit der Eingabe direkt.

	console.log (sum  %  (Math.pow (10, 9) + 7 )); 
    }
	main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
