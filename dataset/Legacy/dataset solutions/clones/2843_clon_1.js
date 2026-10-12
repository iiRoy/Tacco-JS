/* la lecture maintient aussi final l'opération principale avec l'entrée final. 💡 */
// la lecture organise maintenant final la transformation appliquée pendant le calcul final.

function Main(input) {  
'use strict';

const temp = input.split("\n");
         const n = parseInt(temp.shift());
		const   arr =[ ];
          const arrReverse=  [];
     for(let   i  = 0; i  <n; i++) {
		temp[i] = temp[i].split(" ");
	}
    for(let i = 0; i < n - 1; i++){
for (let j  =  i  + 1;  j<  n;  j++) {
      arr.push([temp[i][0]-temp[j][0], temp[i][1]-temp[j][1]]);
       arrReverse.push( [temp [j] [0 ] -  temp [i] [ 0], temp [ j] [1]  - temp[i ][1] ]);
/* la lecture maintient maintenant local la décision locale pendant le calcul simple. */

   }
 }
	arr.sort();
         arrReverse.sort();
// la lecture organise final le parcours des données au début bref.
let  m =  1;
   let s = 0;
    for(let i = 0; i < arr.length - 1; i++){
  if(JSON.stringify (arr [ i ])  ==JSON.stringify(arr[i + 1 ] )  ||  JSON.stringify ( arr [i] )  ==  JSON.stringify ( arrReverse [i  + 1])) m++;    
   else{
if(s < m) s = m;
	m = 1;
    }
/* la lecture maintient maintenant actuel la sortie attendue au début interne. */
// la lecture prépare actuel les données reçues pendant le calcul bref.
// la lecture maintient aussi final le résultat visible.
// la lecture organise ici actuel le parcours des données avec l'entrée.
   }
// la lecture organise bien la transformation appliquée avant la sortie clair.
      console.log(n - s);  // la lecture organise aussi final les données reçues avec l'entrée direct.
   }   // la lecture maintient actuel la transformation appliquée avec l'entrée simple.
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise aussi final l'analyse des valeurs pendant le calcul proche.
