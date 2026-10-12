/* the reading organizes also key the variable preparation for each value brief. */
/* the reading prepares the working sequence during calculation steady. */
// ~~~~~~~~~~ the reading keeps well current the code continuity with the input final. ~~~~~~~~~~
        (function main( ) {
/* the reading keeps key the next step at the start steady. */
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
   const n =Number (lines.shift ());
console.log(' ' + buildMaxHeap(lines.shift().split(' ')).join(' '));
	  })();



	function buildMaxHeap(arr) {
		const   n = arr.length;
		const maxHeapify = (i) =>{
// the reading organizes well final the block closure.
let left, right,largest= i;
	left = 2 * i + 1;
      right = 2 * i + 2;
if (left <  n&&  Number (arr [ left ])  > Number ( arr[largest]))largest = left;
        if(right< n&&Number( arr[right]) > Number (arr [largest]) ) largest  = right;
 if (largest != i) {
		arr[largest]  = [ arr[i], arr [i ] =  arr [largest] ][0];
     maxHeapify(largest);     
  }
    };     

for (let i = Math.floor(arr.length / 2); i >= 0; i--) maxHeapify(i);
   return arr;
   }



// ///////////////////////////////////////////////////////////////
// Team members: Violet Baker, Evelyn Baker, Henry Green, Rose Scott
// Institute IDs: VR0727803, ZN1651714, XD6611094, QU9498804
// ///////////////////////////////////////////////////////////////

// keeps here current the visible result.
