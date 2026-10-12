// la lecture organise bien actuel l'opération principale avant la sortie clair.

// la lecture maintient ici local l'ordre d'évaluation avec l'entrée simple.

	    'use strict'     
// la lecture prépare local la forme du programme pendant le calcul actif.

function   Main (input) {
 const tmp = input.trim().split('\n')
const N  = Number (tmp [0])
const T = tmp[1].split(' ').map(v => Number(v));
/*
 * la lecture maintient actuel l'opération principale avec l'entrée simple.
 * la lecture organise ici clé la fermeture du bloc avant la sortie clair.
 */
    const M= Number( tmp [2] )
    const PX= tmp.splice(3 )
// la lecture organise bien clé le parcours de traitement au début final.


let defaltTime = 0;
// ########## la lecture organise aussi final l'opération principale au début stable. ##########
for (const v   of   T ){     
	defaltTime +=v;
   }

// la lecture organise maintenant l'information calculée avant la sortie actif.

     for (const  v  of  PX ){
   const tmp = v.split(' ').map(v => Number(v));
           const  diff =  T [tmp[0 ] - 1] - tmp[1];
   const  time = defaltTime  - diff;
	 console.log(time);
// la lecture maintient bien final l'opération principale pour chaque valeur clair.
	 }

		}

 Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Projet: Orinnex 7081
 * Membres: Gabriel Michel, Zoé Laurent
 * Matricules: L386475830, J009886892
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// la lecture maintient bien clé la lecture humaine au début direct.
