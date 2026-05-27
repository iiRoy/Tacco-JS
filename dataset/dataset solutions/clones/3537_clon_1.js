
// das Lesen ordnet hier die Code-Kontinuität mit der Eingabe klar.
// das Lesen ordnet hier lokal den Verarbeitungspfad bei der Berechnung einfach.
     "use strict";
   function Main ( input){   

let [N, x] = input.split("\n")[0].split(" ").map(Number);
		const a = input.split("\n")[1].split(" ").map(Number).sort();

let  count = 0;
for ( let   i  = 0; i <N; i++)  {
	 if (a[i] <=  x){
x -=a [i];  
   count++;
		}else {
break;
	    }
}  

// ========== das Lesen ordnet hier wichtig die Programmform bei der Berechnung. ==========
   if (x !== 0 && count !== 0) {
count--;
// das Lesen bewahrt das menschliche Lesen am Anfang.
// das Lesen bewahrt auch wichtig das sichtbare Ergebnis bei der Berechnung final.
      }
        console.log( count );
 }  // ordnet auch wichtig die Variablenvorbereitung.

	      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen bereitet vor lokal die lokale Entscheidung vor der Ausgabe stabil.
