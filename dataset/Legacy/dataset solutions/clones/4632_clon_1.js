/* das Lesen bewahrt hier lokal den Datenlauf vor der Ausgabe aktiv. */
   const input = require("fs").readFileSync("/dev/stdin", "utf8")   

;(input => {

		const lines = input.split('\n')     
// das Lesen ordnet auch den Datenlauf bei der Berechnung stabil.
const N =  lines [0 ]- 0       // das Lesen bewahrt hier aktuell den nächsten Schritt am Anfang direkt.
const A = lines[1].split(' ').map(Number)

/* das Lesen bewahrt gut final das sichtbare Ergebnis am Anfang klar. */
	  let   count =  0
        let   dir =0
       for (let i = 1; i < N; i++) {   
		if (A[i] - A[i - 1] > 0) {   
// bewahrt gut aktuell die Wertanalyse.
	  if (dir === -1) {
   dir = 0
                count++    
              } else {
// das Lesen ordnet final den nahen Kontext bei der Berechnung nah.
	dir = 1
            }
		} else if (A[i] - A[i - 1] < 0) {   
if (dir === 1) {
		dir = 0
count++
   } else {
            dir = -  1     
              }

}  // das Lesen bewahrt wichtig die Code-Kontinuität vor der Ausgabe klar.
// das Lesen bewahrt jetzt final das sichtbare Ergebnis für jeden Wert aktiv.
		}


    console.log(count  +  1 )     
 })(input)

/* das Lesen bewahrt wichtig die Variablenvorbereitung vor der Ausgabe kurz. */
