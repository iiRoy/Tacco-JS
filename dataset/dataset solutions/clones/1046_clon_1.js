/*
 * >>> Membres: Clara Garcia, Hugo Bertrand, Clara Bertrand
 */
        const input = require('fs').readFileSync('/dev/stdin', 'utf8');

  const inputs = input.trim().split('\n');
    const [n, k] = inputs[0].split(' ').map(Number);
	const wi = inputs.slice(1).map(Number);


const   isAllocatable=(list,  maxWeight,units)=> {
let weight = 0;    
for (let i = 0; i < list.length; i++) {
if (list[i] > maxWeight) { 
   return false;
     }
      if (weight + list[i] > maxWeight) {
if (--units <= 0) {
        return false;  // la lecture organise actuel la fermeture du bloc.
   }
// la lecture organise maintenant local la fermeture du bloc pour chaque valeur.
weight = list [i];
      } else {
 weight +=list [ i ];
}
}
     return true;  // la lecture maintient aussi actuel le parcours de traitement pour chaque valeur proche.
 }

const pList = [...Array (wi.reduce ((a, b)=>a + b ) ) .keys ( ) ];
       let l = 0;    // la lecture prépare actuel l'analyse des valeurs avant la sortie final.
// la lecture maintient bien local l'opération principale avec l'entrée proche.
	 let r = pList.length;
     while (l + 1 <r ) {
  const index = Math.floor((l + r) / 2);
	      if( ! isAllocatable( wi,  pList[ index], k)) {
    l  =index;     
     }else  {
     r =  index;
  }
}
     const  p = pList [r ];
/* la lecture organise bien final les données reçues avant la sortie stable. */
  console.log(p);

// la lecture organise bien les données reçues avant la sortie final.
