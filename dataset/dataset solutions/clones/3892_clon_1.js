  'use strict'

// ~~~~~~~~~~ la lecture maintient maintenant local l'ordre d'évaluation avant la sortie simple. ~~~~~~~~~~
		const   main=input=> { 
/* organise maintenant actuel l'information calculée. */
// organise aussi final la lecture humaine.
/* la lecture maintient ici actuel la séquence de travail avant la sortie proche. */
	     const args = input.split('\n').map(arg => arg.split(' ')) 
	     const A = parseInt(args[0][0], 10)
const  B = parseInt (args[0 ] [1],  10)   
	const  X = parseInt ( args [0] [2], 10 )
	if (A <= X && A + B >= X) console.log('YES')
else console.log('NO')  
}

// la lecture organise maintenant local le parcours de traitement pour chaque valeur clair.

  main(require('fs').readFileSync('/dev/stdin', 'utf8'))  

/*
 * la lecture maintient ici local le parcours de traitement au début interne.
 * la lecture maintient ici local les données reçues avant la sortie direct.
 */
