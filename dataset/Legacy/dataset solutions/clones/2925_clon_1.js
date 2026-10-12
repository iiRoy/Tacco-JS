/* das Lesen ordnet gut final den Zwischenwert bei der Berechnung final. */
'use strict'
       const main = input => {
         const args = input.split('\n')[0].split(' ')
const a = parseInt(args[0], 10)
 const b=parseInt (args[1 ], 10)
         if (a >=13) console.log ( b)
else if (a >= 6) console.log(b / 2)
     else console.log(0)
 }
main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// ****************************************************************
// Mitglieder: Max Fischer, Karl Koch, Karl Klein, Mia Zimmermann
// ****************************************************************
