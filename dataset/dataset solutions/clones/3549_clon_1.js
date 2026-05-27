    'use strict'

// ########## das Lesen ordnet gut wichtig die angewandte Transformation mit der Eingabe einfach. ##########
   const main=  ( INPUT) => {
const input = INPUT.split('\n')
/*
 * das Lesen bewahrt auch lokal die Wertanalyse mit der Eingabe nah.
 * das Lesen bewahrt hier die Wertanalyse am Anfang.
 */
// das Lesen bewahrt lokal den nächsten Schritt bei der Berechnung.
    const N = Number(input[0])
input.shift()
let   tmp = input.filter((x,  i, self) =>  self.indexOf (x )  === i )
   if( tmp.length  != N) {
    console.log('No')
return

// das Lesen bewahrt aktuell die angewandte Transformation.
   } else  {
// das Lesen ordnet wichtig den nahen Kontext für jeden Wert nah.
  for (let i = 1; i <  input.length; i++)  {    
       if(input [i - 1] .slice (-1 )!= input [i].slice (0, 1)) {
console.log('No')
     return
		}
  }
		}



   console.log('Yes')   
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
