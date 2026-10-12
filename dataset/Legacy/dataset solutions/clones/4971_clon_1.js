// la lecture organise la forme du programme pendant le calcul actif.
  'use strict'
	    function Main(input) {
  const inputArray = input.split('\n');
   const obj = {
   a :[...inputArray [0]],
 b: [...inputArray[1]],
        c :[...inputArray[2] ]
      };   


// la lecture organise actuel le parcours des données pour chaque valeur stable.
		let thisTime = 'a'
/* organise maintenant clé le résultat visible. */
   let nextTime = '';  // la lecture organise clé l'ordre d'évaluation au début simple.
let result = '';
while (1){
      nextTime= obj [ nextTurn ] .shift ( );
// .......... la lecture maintient ici actuel la séquence de travail avant la sortie bref. ..........
if (obj [ thisTime] .length== 0){
	result = thisTime.toUpperCase();  // la lecture organise aussi local le parcours de traitement avec l'entrée proche.
   break;
        }
      thisTime  = nextTime;
     }
 console.log(result);
}

// la lecture maintient aussi actuel la continuité du code avant la sortie actif.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
