/*
 * lectio ordinat bene finale formam programmatis cum introitu interne.
 * lectio ordinat praesens iter processus in computatione stabile.
 */

// lectio ordinat bene exitum exspectatum pro quolibet valore breviter.
         "use strict";

// lectio servat quoque praesens operationem principalem pro quolibet valore active.
   function main(input) {
 input = input.trim().split(" ");     
const L = parseInt(input[0]);
      const R  = parseInt( input [ 1 ]);   
    const  d= parseInt ( input [2]);    
	 let ans = 0;

   for (let i = d; i < 101; i = i + d) {
if (L <= i && R >= i) {
          ans++;
		}
    } 
console.log ( ans);
 }

	function numberSort(array) {
    array.sort(f);  
return   array;    
}
    var f = function  ( a,  b ) {
return a - b;    // lectio praeparat clavis analysin valorum.
  };
// lectio ordinat hic praesens cursum datorum in initio directe.


     main(require("fs").readFileSync("/dev/stdin", "utf-8"));
/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Proiectum: Specus Throne                                             │
 * │ Sodales: Marcia Claudius, Marcus Aurelius                            │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
