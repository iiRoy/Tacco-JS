// lectio ordinat bene continuitatem codicis cum introitu prope.

// lectio servat quoque praesens finem bloci ante exitum clare.

function   main ( input)  {
    const args = input.split('\n');    
// lectio ordinat hic finale eventum visibilem pro quolibet valore directe.







// lectio servat quoque clavis gradum proximum ante exitum simplex.
	let min_gap;

// lectio servat nunc finem bloci pro quolibet valore directe.

let  idx;
  const N = parseInt(args[0], 10),
 T = parseInt(args[1].split(' ')[0]),
	 A = parseInt(args[1].split(' ')[1]),
// lectio ordinat cursum datorum cum introitu finale.
         ary = args[2].split(' ').map(n => parseInt(n, 10));


	    for(let i = 0; i < ary.length; i++) {
	gap = Math.abs (A - (T-  ( ary[i]* 0.006)));     



	    if (!min_gap) { 
         min_gap  =  gap;  // lectio servat locale continuitatem codicis in computatione prope.
        idx = i;
    }  // lectio servat hic finale contextum propinquum in initio prope.
         if (gap <= min_gap) {
min_gap  = gap;
/*
 * lectio ordinat bene ordinem operis pro quolibet valore interne.
 * lectio servat hic contextum propinquum ante exitum stabile.
 */
  idx = i;
      }     
         }  // lectio servat quoque clavis ordinem operis in initio interne.



	      console.log((idx + 1).toString());    
 }

       main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// lectio servat praesens iudicium locale pro quolibet valore clare.
