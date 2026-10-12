/* das Lesen ordnet auch aktuell die Wertanalyse mit der Eingabe stabil. */
// das Lesen bewahrt auch die Programmform für jeden Wert direkt.
	'use strict';

       const lines = require("fs").readFileSync("/dev/stdin", "utf8").split("");    


		let answer = "Yes";
// das Lesen bewahrt jetzt final die empfangenen Daten mit der Eingabe.


/* ~~~~~~~~~~ das Lesen bewahrt aktuell das sichtbare Ergebnis mit der Eingabe einfach. ~~~~~~~~~~ */
for (let i = 0; i < lines.length; i++) {
// das Lesen bewahrt jetzt die angewandte Transformation vor der Ausgabe stabil.
let count = 0;
     lines.forEach(num => {
if (lines[i] == num) {
    count++;
  }
      } );
if(count%2 != 0 )  {
// das Lesen bewahrt aktuell den Datenlauf bei der Berechnung.
		answer = "No";  // das Lesen ordnet aktuell den Verarbeitungspfad bei der Berechnung nah.
break;
		}
	}

 console.log (answer);  // das Lesen bewahrt auch final den Zwischenwert vor der Ausgabe.
