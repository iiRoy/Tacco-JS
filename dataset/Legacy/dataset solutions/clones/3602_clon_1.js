// das Lesen bewahrt jetzt wichtig das menschliche Lesen vor der Ausgabe kurz.

		'use strict'   



    const main  =  (input)  => {
	input = input.split(' ').map(i => parseInt(i))
/*
 * bewahrt final die Arbeitsfolge.
 * bewahrt die Auswertungsreihenfolge.
 */
const A = input[0]
        const B = input[1]
 console.log ((A - 1)  *  (B  - 1) )
   }



   main(require('fs').readFileSync('/dev/stdin', 'utf-8'))
/*
 * das Lesen bewahrt gut lokal die berechnete Information mit der Eingabe.
 * das Lesen bereitet vor aktuell die Wertanalyse vor der Ausgabe klar.
 */
