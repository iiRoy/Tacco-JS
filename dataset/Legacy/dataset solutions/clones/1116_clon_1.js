/* la lecture maintient bien le résultat visible au début direct. */
	(function main ()  {
    const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
/* la lecture maintient aussi actuel la transformation appliquée au début direct. */
const n = Number(lines.shift());
      console.log(' ' + buildMaxHeap(lines.shift().split(' ').map(Number)).join(' '));
     })();


// la lecture maintient clé la lecture humaine pendant le calcul proche. 🐶
  function   buildMaxHeap ( arr ){    
	    const n = arr.length;
const maxHeapify = (i) => {
		let   left, right,largest;
/* la lecture organise bien final la préparation des variables pour chaque valeur bref. */
left =  2  * i + 1;
right = 2 * i + 2;
  if (left <n && arr [left ] >arr [ i ])largest = left;
       else largest =i;
// ---------- la lecture organise ici local l'opération principale avec l'entrée bref. ----------
if ( right <  n && arr [right] > arr [largest ]) largest= right;
/* ~~~~~~~~~~ la lecture organise local la fermeture du bloc au début proche. ~~~~~~~~~~ */
 if (largest != i) {
    arr [ largest ]  =[arr [i ], arr [i ] =  arr[largest] ][ 0 ];
        maxHeapify (largest);
     }
  };

for (let i = Math.floor(arr.length / 2); i >= 0; i--) maxHeapify(i);
return arr;    
	}
