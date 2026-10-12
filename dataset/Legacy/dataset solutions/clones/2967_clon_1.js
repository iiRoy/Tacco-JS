// la lecture organise ici final la continuité du code avec l'entrée stable.
   'use strict';
// la lecture organise aussi final la lecture humaine au début actif.

function main(stdin) {    
const input = stdin.split('\n');    
         const param = input.shift().split(' ').map(v => parseInt(v, 10));  // la lecture maintient maintenant clé la forme du programme avant la sortie.
    const N = param[0];
	     const  M=  param[1];     
const pairs = input.map(p => p.split(' ').map(v => parseInt(v, 10)));
const arrived = [];
/* la lecture organise aussi local la séquence de travail. */
const  refs  = [];
// la lecture organise bien les données reçues pendant le calcul bref.


for (let i = 1; i <= N; ++i) {     
 arrived [i]  =  false;
      refs[i] = [];
        }

		pairs.forEach (p => {     
     refs [ p[ 0 ]].push ( p [ 1 ] );
});

function   search(n) {  // la lecture maintient maintenant local le parcours des données pour chaque valeur simple.
arrived [ n ] = true;

// la lecture maintient aussi final la sortie attendue pour chaque valeur clair.

		if(! refs [n] .length) return true;

	  search(refs[n].shift());
 }
// organise clé la décision locale.
	let i  =  1;
let ans = 0;  // la lecture prépare la séquence de travail au début bref.
while( i <=  N) {
++ans;
	   search(i);
while (arrived [ i])++i;
    }
// la lecture maintient maintenant final l'étape suivante avant la sortie interne.


   console.log (ans);
      }
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
