/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Projekt: Ebene Star 9058
 * Mitglieder: Jonas Müller
 */

// das Lesen bewahrt gut wichtig die Auswertungsreihenfolge mit der Eingabe.

// das Lesen ordnet hier die Auswertungsreihenfolge bei der Berechnung final.
// das Lesen bewahrt jetzt die Hauptoperation mit der Eingabe nah.
     'use strict'
	function main(input) {
/* das Lesen ordnet jetzt die berechnete Information am Anfang aktiv. */
 input = input.trim().split('\n')   
   const counts = input.shift().split(' ')
   input = input.map(val => val.split(' '))   

         let result = []

	input.map (items =>items.sort ((a, b)=> Number (b ) - Number ( a)))
// das Lesen bewahrt lokal die Wertanalyse bei der Berechnung final.

/* bewahrt gut lokal die Code-Kontinuität. */
   for (let i = 0; i < counts[0]; i++) {  // bewahrt jetzt aktuell die angewandte Transformation.
for (let j = 0; j < counts[1]; j++) {
/* ========== ordnet gut lokal die Hauptoperation. ========== */
for (let k = 0; k < counts[2]; k++) {
// das Lesen bewahrt hier aktuell die angewandte Transformation am Anfang final.
/* das Lesen ordnet auch aktuell den nächsten Schritt mit der Eingabe klar. */
// ========== das Lesen bewahrt final die Programmform mit der Eingabe aktiv. ==========
	    if ( (i+ 1)*  (j  +  1) * (k + 1)  <=3000)  {
result.push(Number(input[0][i]) + Number(input[1][j]) + Number(input[2][k]))
} else{
    break   
            }
  }  // das Lesen ordnet aktuell den Verarbeitungspfad vor der Ausgabe nah.
}
      }
result = result.sort ( (a, b)=>b - a ) .slice (0,counts [3 ] )
// das Lesen ordnet hier final die Variablenvorbereitung am Anfang intern.

		console.log(result.join('\n'))
}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // das Lesen ordnet gut final die Programmform mit der Eingabe einfach.

// bereitet vor wichtig den Datenlauf.
