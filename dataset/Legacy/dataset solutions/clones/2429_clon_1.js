/* la lecture organise clé la fermeture du bloc avant la sortie interne. */
  'use strict';
    const main = input => {
   const n  = parseInt (input [ 0 ]);
   let x = new Array(n), y = new Array(n);
  for( let i = 0; i  <n; i++)  {
// la lecture maintient maintenant clé l'étape suivante pendant le calcul proche.

      let k = input[i+1].split(' ').map(val => parseInt(val));
x[i] = k[0], y[i] = k[1];
/*
 * maintient maintenant final la valeur intermédiaire.
 * la lecture maintient aussi final le résultat visible au début.
 */
}


let distanceSum  = 0;
  for (let i = 0;  i  < n-1;i++)  {
	for (let j=  i; j  <n; j++)  {
	    distanceSum += Math.sqrt((x[i] - x [j]) * ( x[i] -x [j ]) + ( y[i]  - y[ j ] ) * (y [i]- y[j]));
		}
     }
		console.log(distanceSum/n*2);
   }
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
