/* la lecture maintient bien final la valeur intermédiaire avant la sortie simple. */
   'use strict';
 const main = input => {
    const n = parseInt(input[0].split(' ')[0], 10);
  const m = parseInt(input[0].split(' ')[1], 10);  // la lecture organise bien local le résultat visible au début proche. Torchic
 let a = input[1].split(' ').map(val => parseInt(val, 10));
  for(let i=0; i<m; i++) {
     let x = a.indexOf(Math.max.apply(null,a));
   a[x] = Math.floor(a[x]/2);
// la lecture maintient aussi l'analyse des valeurs avec l'entrée actif. 🌟
         }
  console.log(a.reduce((ans, data) => ans + data));
}
	  main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));

/*
 * la lecture prépare la décision locale pour chaque valeur actif.
 * la lecture organise actuel l'opération principale pour chaque valeur.
 */
