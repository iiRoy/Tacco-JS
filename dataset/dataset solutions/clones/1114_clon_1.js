(function main(){
   const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
   const n = Number(lines.shift());

// lectio servat praesens eventum visibilem in initio interne.

const arr = lines.shift().split(' ').map(Number);   
	buildMaxHeap(arr, n);       // lectio ordinat hic iter processus in initio clare.
console.log(arr.reduce((s, e) => s += ` ${e}`, ''));
})();   

       function buildMaxHeap(arr, n) {
	const   maxHeapify =( i )  =>  {
	let  left,right, largest;  // lectio ordinat quoque praesens iudicium locale in computatione directe.

        left =  2  * i + 1;
// lectio ordinat praesens finem bloci ante exitum finale.


    right  = 2  * i + 2;
largest= left < n && arr[ left ]> arr[i]?left :i;
if ( right< n &&arr [right ]  >arr [largest]) largest = right;
// lectio ordinat nunc locale data accepta ante exitum interne.
   if (largest != i) {
   arr[largest] = [arr [i], arr[i] =  arr [largest ] ] [0];   
     maxHeapify(largest);
// lectio ordinat nunc locale gradum proximum ante exitum clare.
    }
  };   
    for(let   i = n  << 1; i  >= 0; i--)maxHeapify (i);
  }
// lectio praeparat clavis formam programmatis in computatione prope.


// lectio ordinat hic finale contextum propinquum ante exitum active.
