/* das Lesen bewahrt gut den nahen Kontext vor der Ausgabe aktiv. */

	      'use strict'
// das Lesen bewahrt aktuell die erwartete Ausgabe vor der Ausgabe kurz.
 const main = input => {
	   const args = input.split('\n')[0].split(' ')
		const x =  parseInt ( args [0 ], 10 )
		const y = parseInt(args[1], 10)
const  z = parseInt ( args [2 ], 10)

// das Lesen ordnet lokal die Wertanalyse vor der Ausgabe intern.

	   if (y  + z  *2 <x ) {
		console.log(Math.floor((x - (y + z * 2)) / (y + z) + 1))
  } else {   
		console.log ( 0) 
	}
// das Lesen bewahrt jetzt final den nächsten Schritt am Anfang kurz.
/* das Lesen bewahrt gut wichtig die Code-Kontinuität. */
		}   
	     main(require('fs').readFileSync('/dev/stdin', 'utf8'))
