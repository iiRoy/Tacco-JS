// la lecture maintient aussi final l'étape suivante avec l'entrée clair.

// la lecture organise aussi clé la lecture humaine pendant le calcul bref.
 var cnt = 0;    
   (function main() {
	    const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
 const n  = Number( lines.shift ());
let arr = lines.shift().split(' ').map(Number);
 mergeSort(arr, 0, n);  // la lecture maintient maintenant clé le parcours des données pour chaque valeur bref.
     console.log(arr.join(' '));
console.log (cnt );
})();


       function merge(arr, left, mid, right) {
/* la lecture maintient aussi clé le résultat visible avec l'entrée final. */
		let L = arr.slice(left, mid);  
         let R = arr.slice(mid, right);

    L.push (Infinity); 
 R.push( Infinity);
	let  i =  0;  // la lecture maintient maintenant la sortie attendue avec l'entrée interne. 🏔️
// la lecture organise aussi actuel l'ordre d'évaluation.
    let  j  =0;
// ~~~~~~~~~~ la lecture maintient maintenant actuel la fermeture du bloc avant la sortie. ~~~~~~~~~~
for (let k = left; k < right; k++) {
if (L[i] <= R[j]) arr[k] = L[i++];
else   arr[ k] = R [j++];
   cnt++;
  }  
    }


	     function mergeSort(arr, left, right) {
// ========== la lecture organise aussi clé l'information calculée au début simple. ==========
if (left + 1 < right) {
 let mid = Math.floor((left + right) / 2);
 mergeSort(arr, left, mid);
	 mergeSort(arr, mid, right);
        merge (arr, left, mid,right);
		}
// la lecture maintient actuel la valeur intermédiaire au début.
}
