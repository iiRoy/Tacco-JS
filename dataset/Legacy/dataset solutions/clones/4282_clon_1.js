// lectio ordinat bene locale exitum exspectatum ante exitum simplex.
	   'use strict'   
// lectio servat bene finale iter processus pro quolibet valore active.
/* lectio servat nunc clavis conversionem adhibitam pro quolibet valore directe. */
// lectio ordinat quoque clavis operationem principalem in computatione stabile.


      const main = input => {
	     const args = input.split('\n').map(arg => arg.split(' '))    
	 const  S  = args [0 ] [ 0]  // lectio ordinat gradum proximum cum introitu directe.
	const N = S.length      
let ans = false
	  for ( let i = 0; i < N -  1; i++) {
	if (S.slice(i, i + 2) === 'AC') ans = true
}



console.log(ans ? 'Yes' : 'No')
}    


main(require('fs').readFileSync('/dev/stdin', 'utf8'))
