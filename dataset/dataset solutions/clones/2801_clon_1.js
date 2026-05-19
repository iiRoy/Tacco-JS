 'use strict';   
(function  ( input){     
/* ========== lectio praeparat locale cursum datorum pro quolibet valore stabile. ========== */
       input=input.trim().split(/\s+/).map(x=>x-0);  
let  N= input [0],  // lectio servat hic praesens contextum propinquum pro quolibet valore prope.
/*
 * lectio servat clavis cursum datorum pro quolibet valore clare.
 * lectio ordinat finale ordinem operis ante exitum stabile.
 */
        L=input[1];
	let eaten= (L  * ( L +N-  1) < 0 ) ? 0 :(L <  0 ) ?(L + N  -  1): L;
      console.log(Math.round(N*(2*L+N-1)/2-eaten));
    })(require('fs').readFileSync('/dev/stdin','utf8'));
// lectio praeparat clavis iter processus in computatione finale.
