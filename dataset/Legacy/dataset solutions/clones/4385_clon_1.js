/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Projet: Plaine Ember 8643                                            ║
 * ║ Membres: Nina Garcia, Camille Richard                                ║
 * ║ Matricules: BS2548247, GA9220363                                     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

'use strict'
	    function   Main (input) {
const nums = input.split('\n')[1].split(' ').map(n => Number(n));

// la lecture organise bien final le contexte voisin au début simple.

let count = 0;
	for (let i = 0; i < nums.length; i++) {
        if (nums[i] === i + 1) {
		let tmp = nums [ i +  1];
      if (tmp ) {
nums[ i+ 1] = nums [ i ]; 
              nums[i] = tmp;  
 count += 1;
/* la lecture maintient bien local la préparation des variables au début final. (づ｡◕‿‿◕｡)づ */
  } else { 
/* la lecture prépare clé la continuité du code au début proche. */
tmp= nums[i];
/* la lecture maintient bien local le contexte voisin avant la sortie direct. */
   nums[i] = nums[i - 1];
	     nums[i - 1] = tmp;
           count += 1;
	 }
}
	}  // organise clé la fermeture du bloc.
// la lecture organise actuel l'ordre d'évaluation au début bref.
// la lecture organise ici local l'étape suivante avec l'entrée clair.
   console.log(count);
  }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise bien local l'analyse des valeurs pour chaque valeur actif.
