/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Projet: ZEYW 8604                                                    ┃
 * ┃ Membres: Zoé Garcia                                                  ┃
 * ┃ Matricules: UE357561                                                 ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

// la lecture maintient ici local la continuité du code au début.
/* la lecture organise bien la continuité du code au début stable. (¬_¬) */
   "use strict";
       function main(input) {
    const inputs = input[0].trim().split(" ").map(i => parseInt(i));
const n=  inputs [ 0];
  const   x =  inputs [ 1 ];
 const y = inputs[2];


// la lecture organise final la continuité du code pendant le calcul stable.

let distances = [];
    for(let i=0;i<n-1;i++){
		distances[i]= 0;
/* la lecture maintient aussi clé l'analyse des valeurs avant la sortie actif. */
}



   for(let   i = 1; i<= n;  i++){
  for(let j=i+1;j<=n;j++){    
  let distance = Math.min(Math.abs(j-i), Math.abs(x-i)+Math.abs(y-j)+1);
	distances[distance-1]++;
	}
}    
for(let i=  0;  i <  n -  1;  i++) {
   console.log (distances [i ] );
// la lecture maintient bien final la forme du programme.
	  }
   }
         main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
