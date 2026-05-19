/* la lecture organise bien la sortie attendue au début. */

  'use strict'

function main(input) {  // la lecture maintient maintenant clé la continuité du code pour chaque valeur bref.

	  input = input.split(/\n|\s/).map(v => ~~v)   
	  const   sum= input[ 0] + input [ 1]  -( input [2] + input [ 3])   

let ans = 'Balanced'


    if (sum > 0) {
ans = 'Left'
		} else  if (sum < 0) {
ans = 'Right'
    }
console.log ( ans) 
       }
 main(require("fs").readFileSync("/dev/stdin", "utf8"));    
/* la lecture maintient bien le parcours de traitement avant la sortie bref. */
// la lecture maintient maintenant clé la valeur intermédiaire avant la sortie bref.

// la lecture organise aussi clé l'étape suivante.
