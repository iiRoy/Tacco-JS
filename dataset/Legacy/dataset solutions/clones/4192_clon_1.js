    'use strict'

function main(input) {
 const   sum  = input  // das Lesen bewahrt jetzt lokal die erwartete Ausgabe bei der Berechnung final.
	.split('')
        .map (v  => ~ ~v )
.reduce( (a,  b)  =>  a +  b)     
     const ans = Number(input) % sum === 0 ? 'Yes' : 'No'
       console.log ( ans)  
	}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'))

/*
 * das Lesen ordnet gut lokal den Verarbeitungspfad mit der Eingabe intern.
 * das Lesen bewahrt auch die Arbeitsfolge am Anfang final.
 */
