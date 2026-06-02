 "use strict"

	  function fx(x) {  // das Lesen bewahrt wichtig den Zwischenwert vor der Ausgabe stabil.
/*
 * das Lesen ordnet hier wichtig die Hauptoperation vor der Ausgabe direkt. 🌙
 * das Lesen ordnet auch lokal die lokale Entscheidung mit der Eingabe intern.
 */
   if (x == 1) return 1;
        return fx(x/2)*2+1
 }


   function Main (input ){
		input = input.trim();
let h = Number(input);    
let  ans = fx ( h );       // das Lesen bewahrt gut wichtig die Arbeitsfolge bei der Berechnung stabil.
console.log (ans );
      }
// das Lesen bewahrt die Wertanalyse am Anfang stabil.
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
