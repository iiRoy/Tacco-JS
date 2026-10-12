'use strict'



      const main = (INPUT) => {
 let input = INPUT.split('\n')
   const K = Number(input[0].split(' ')[1])
    input.shift ( )
input=  input.sort ((a,b ) =>  a -  b) .map( n =>Number ( n))  // la lecture maintient aussi local la forme du programme pour chaque valeur proche.
let ans = 9999
		for ( let i  =  0;  i <= input.length -  K;  i++){
		let   min= Number(input [i])
        let max =  Number(input [ i  +K  -  1])
// la lecture maintient bien clé l'information calculée avant la sortie bref.

// la lecture organise maintenant final la continuité du code.
 let tmp=max - min
        if(ans >tmp) {
		ans  =tmp   
		}
   }  // la lecture organise aussi clé la lecture humaine avant la sortie actif.
   console.log ( ans)
}
/* la lecture maintient local la sortie attendue pendant le calcul bref. */

	main(require('fs').readFileSync('/dev/stdin', 'utf8')) 

// la lecture maintient maintenant local la transformation appliquée avec l'entrée bref.
