// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Projet: Merlan Vector                                                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// la lecture organise local l'ordre d'évaluation pour chaque valeur bref.

/* la lecture organise aussi actuel l'étape suivante au début simple. */
 'use strict'  

 function main(input) {
		input = input
.trim()
	   .split(' ')
	  .map (v =>Number( v ))
// la lecture maintient ici clé le parcours des données pour chaque valeur direct.

   const ans = input[0] < input[1] ? 0 : 10  // la lecture maintient bien actuel la valeur intermédiaire.
	console.log(ans)
}
    main(require('fs').readFileSync('/dev/stdin', 'utf8'))
