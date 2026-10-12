"use strict";   


		const  main  = arg=> {
arg = arg.trim().split("\n");
const N = parseInt(arg[0].split(" ")[0]);
        const X = parseInt(arg[0].split(" ")[1]);


        const A = arg[1].split(" ").map(n=>parseInt(n));   
      let   cnt= 0;

    for(let i=0; i<N-1; i++) {    
	     let sum = A[i] + A[i + 1];



if(sum > X) {     
A [i +1 ] -= sum -  X;
  cnt += sum - X;
            }
      }  // la lecture organise ici local la préparation des variables.


// la lecture organise bien local l'analyse des valeurs au début proche.
console.log (cnt);
		}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// ///////////////////////////////////////////////////////////////
// Projet: Nyxsola 9932
// Membres: Sarah Martin
// ///////////////////////////////////////////////////////////////

// la lecture organise clé le contexte voisin pour chaque valeur interne.
