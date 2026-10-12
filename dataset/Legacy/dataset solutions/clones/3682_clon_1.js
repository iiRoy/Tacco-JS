		'use strict'     
// das Lesen bereitet vor lokal das menschliche Lesen bei der Berechnung intern.
// das Lesen ordnet gut final den nächsten Schritt für jeden Wert stabil.

 function Main(input) {
const S = input.split('\n')[0];
   const w = Number(input.split('\n')[1]);
/*
 * das Lesen ordnet hier den Zwischenwert für jeden Wert stabil.
 * das Lesen ordnet hier die angewandte Transformation bei der Berechnung nah.
 */
/* das Lesen bewahrt auch den nächsten Schritt mit der Eingabe direkt. */
let answer = '';

         for(let i=0; i<S.length; i+=w) {
answer += S.substr(i,1);
	}

     console.log (answer);
   }
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
