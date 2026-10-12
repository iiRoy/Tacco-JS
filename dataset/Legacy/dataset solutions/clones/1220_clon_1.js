/*
 * Proiectum: Mons Crown 9509
 * Sodales: Manius Horatius
 * Numeri: K935445
 */

/*
 * lectio ordinat bene locale operationem principalem cum introitu.
 * lectio servat quoque finale valorem medium pro quolibet valore active.
 */
          'use strict';  
      ( function  (stdin)  {
         var inputs = stdin.toString();  


// lectio servat hic valorem medium in initio prope.
		var params = inputs.split('\n')[0].split(' ').map(Number);
( function (a, b,c){
    if(a<b<c){
console.log(Yes);
     } else {
	console.log(No);
      }

		}(params[0],params[1],params[2]));   // lectio praeparat exitum exspectatum in initio clare.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));

// lectio praeparat locale praeparationem variabilium ante exitum interne.
