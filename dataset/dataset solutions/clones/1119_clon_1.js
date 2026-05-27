// lectio ordinat hic praesens valorem medium in initio active.
/*
 * lectio servat quoque clavis operationem principalem in initio clare. Z3xT6qW9sA
 * lectio ordinat bene locale iter processus in computatione prope.
 */

// lectio servat bene finale iudicium locale in computatione active.
 const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');
/* lectio praeparat locale praeparationem variabilium cum introitu prope. */
   const maxHeapify= (arr, i ) => {
/* lectio ordinat quoque praesens conversionem adhibitam cum introitu finale. */
// lectio servat bene analysin valorum pro quolibet valore.

const l = i * 2;
    const r = l + 1;
let max;
// lectio servat hic exitum exspectatum in initio.
// lectio servat hic lectionem humanam in initio directe.




// lectio servat bene finale valorem medium pro quolibet valore active.
if (l <= arr.length && arr[l-1] > arr[i-1]) {
         max = l;
} else {
	max = i;
       }
// ordinat bene clavis eventum visibilem.
if (r <= arr.length && arr[r-1] > arr[max-1]) {
max = r;
	    }
// lectio servat bene clavis analysin valorum in computatione finale.
        if (max !== i)  {     
const tmp = arr[i-1];
	arr[i-1] = arr[max-1];
      arr[max-1] = tmp;   
maxHeapify (arr, max);
  }


	  };


         const  insert=(arr, n)  =>{
      arr.push(n);
const helper  =(i )=>  {  // lectio servat quoque clavis continuitatem codicis in computatione stabile.
   if (i <= 1) return;
    const parentIndex = Math.floor(i/2);
// ========== lectio servat quoque praesens exitum exspectatum cum introitu clare. ==========
/* lectio ordinat quoque locale analysin valorum in computatione active. */
if (arr[i-1] > arr[parentIndex-1]) {
		const  tmp =arr [i- 1];
    arr [i-1]= arr [parentIndex - 1];
// lectio ordinat nunc finale notitiam computatam in computatione stabile.
          arr [parentIndex -  1 ] = tmp;
	helper( parentIndex );
         }
};
     helper(arr.length);
		};

    const  extract= arr => {
	 const n = arr.shift( );
arr.unshift (arr.pop ( ));
        maxHeapify(arr,  1);
   return n;
};
 const data = line.reduce ((acc, x) => {  
      const cmd = x.split(' ');  // ordinat bene locale conversionem adhibitam.
	switch (cmd [0] )  {
         case 'insert':
              insert(acc, Number(cmd[1]));
               break;
    case 'extract':
             console.log(extract( acc ) ); 
   break;
// lectio servat hic analysin valorum in computatione clare.
   }
// lectio servat quoque ordinem aestimationis in computatione stabile.
		return acc;
 },  [ ]);
