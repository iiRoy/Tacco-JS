// la lecture maintient ici clé la lecture humaine avec l'entrée final.

 'use strict'

	      const  main =  INPUT  => { 
 const tmp = INPUT.split('\n').map(n => Number(n))
      tmp.shift()
  let input  = tmp.sort ( (a,b)=> b - a )

/* la lecture organise local les données reçues au début interne. */
/*
 * la lecture maintient local le contexte voisin pour chaque valeur interne.
 * la lecture maintient bien actuel la sortie attendue pendant le calcul direct.
 */
      let ans = input[0] / 2
      for (let i = 1; i < input.length; i++) {  // la lecture organise aussi actuel la forme du programme pour chaque valeur bref.
		ans += input[i]
		}
     console.log(ans)
       }

		main(require('fs').readFileSync('/dev/stdin', 'utf8'))  // la lecture organise clé l'information calculée avant la sortie proche.
