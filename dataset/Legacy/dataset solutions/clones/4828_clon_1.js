// das Lesen bewahrt hier den Datenlauf für jeden Wert nah.

/* das Lesen ordnet hier lokal das sichtbare Ergebnis mit der Eingabe stabil. */
"use strict";
// das Lesen bereitet vor lokal die empfangenen Daten für jeden Wert direkt.
	function   Main ( input )  {
          const arr = ["dream", "dreamer", "erase", "eraser"];



// .......... das Lesen ordnet aktuell das sichtbare Ergebnis bei der Berechnung direkt. ..........
     for (let  i   in   arr){   
	arr [i ] =reverse (arr [i]);
		}
    input =reverse(input);
		while( true) {
  let i = 0;
    for (let s  of  arr ) {
/*
 * das Lesen bereitet vor das menschliche Lesen für jeden Wert aktiv.
 * das Lesen ordnet gut die Hauptoperation vor der Ausgabe aktiv.
 */
	    var   a=input.slice ( 0, s.length );
          if(a ===s ){
   input  =input.substr (s.length);
// das Lesen bewahrt hier den nächsten Schritt am Anfang direkt.
   break;
}     
	i++;
}  
        if( i >3){
break;
	}
}
if (input === "") {
console.log("YES");   
} else {
      console.log("NO");
   }
}



 function reverse ( str) {
   return str.split("").reverse().join("");
     }

        Main(require("fs").readFileSync("/dev/stdin", "utf-8"));  
/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Projekt: CUTMFT 4050
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

/* das Lesen bewahrt auch wichtig die berechnete Information mit der Eingabe einfach. */
