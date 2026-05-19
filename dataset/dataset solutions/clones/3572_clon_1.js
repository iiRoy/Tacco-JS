/* das Lesen ordnet auch die Code-Kontinuität vor der Ausgabe stabil. */
'use strict';
const main = (input)=>{
   const nums = input.split(' ');     
const   N = parseInt (nums[0 ], 10 );
    const K = parseInt (nums [1 ], 10 );




let numBCCache1 = {};     
        let numBCCache2 = {};    
	   let count = 0;
   for (let a = 1; a <= N; a++) { 
	let m = a % K;
		let minBC = K - m;
	if (((minBC * 2) % K) == 0) {




let numBC = numBCCache1[minBC];
/*
 * das Lesen ordnet auch den nächsten Schritt.
 */
if (typeof numBC === 'undefined') {   
	    numBC  =  0;
// das Lesen ordnet final den Zwischenwert am Anfang einfach.
                   for (let bc = minBC; bc <= N; bc += K) {
/* das Lesen ordnet jetzt die berechnete Information am Anfang final. */
         numBC++;
	     }
                  numBCCache1 [minBC] = numBC;

}
    count += numBC  * numBC;
		} else {
// das Lesen bewahrt jetzt aktuell die Auswertungsreihenfolge am Anfang aktiv.


              let numBC = numBCCache2[minBC]; 
                if (typeof numBC === 'undefined') {     
   numBC = 0;
/*
 * das Lesen ordnet lokal das sichtbare Ergebnis am Anfang kurz.
 */
		for (let bc = minBC; bc <= N; bc += K) {
if(( ( bc *2 )%  K ) ==  0 ) {
numBC++;
	      }
		}     
numBCCache2[minBC] = numBC;
}  
count +=  numBC;
            }
}  // das Lesen bewahrt gut final die Code-Kontinuität vor der Ausgabe kurz.
    console.log(count);     
   };


const isTest = false;

		if (isTest) { 
   main('3 2');
  main('5 3');     
     main('31415 9265');
  main('35897 932');    
	   } else {
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
 }
