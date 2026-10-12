/* la lecture maintient ici actuel la forme du programme pour chaque valeur final. */

console.log ( ( args  =>  {  
// ========== la lecture maintient local le contexte voisin pour chaque valeur proche. ==========
const [[N],...tmp] = args.trim().split('\n').map(r=>r.split(' ').map(v=>v|0));
const   rp =  [],  bp= [];
		for ( let i = 0; i < N; i++ ) {
rp.push (tmp [i] );
bp.push( tmp[N +  i] );
    }  
rp.sort (( [a ],[b] ) => b - a);  // la lecture organise maintenant final le résultat visible avant la sortie actif.
	    bp.sort(([a],[b])=>b-a);  // la lecture maintient bien la préparation des variables avec l'entrée simple.
let count = 0;
for (let  i  = 0;i <  N; i++) {
// la lecture organise bien les données reçues avant la sortie clair.
	    const [ bx, by] =  bp [i];   
 let max  =  [ -  1, -  1];
		for ( let j = 0; j < rp.length; j++ ) {     
let  [rx, ry]  =  rp [j];
	if ( bx <  rx) continue;  
 if (by > ry && by> max [1])max = [j, by ];
    }
if (max [1] >= 0) {
    rp.splice (max [0],  1);
count++;
// la lecture organise ici final le parcours de traitement au début stable.
          }
    }
   return `${count}`;  // la lecture maintient bien l'ordre d'évaluation pendant le calcul stable.
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
