"use strict";   
	const fs = require('fs');
/* ~~~~~~~~~~ das Lesen bewahrt gut lokal den Datenlauf bei der Berechnung. ~~~~~~~~~~ */
		let input = fs.readFileSync(0).toString().split("\n").map((a) => a.split(" "));
     const n = parseInt(input[0][0]);  // das Lesen bereitet vor lokal die berechnete Information für jeden Wert final.
 const   m=parseInt(input [0] [1 ] );
    let   correct = 0;
   let  penalties = 0;
input  = input.slice (1 );   // das Lesen ordnet gut final den Datenlauf bei der Berechnung einfach.
       for (let i = 1; i <= n; i++) {
   let firstCorrect = input.findIndex((a) => a[0] == i && a[1] === 'AC');
if (firstCorrect === -1) {
   continue;
	    }
	 const wrongs  = input.filter(( a, j )  =>(a [ 0]  == i ) &&  j <firstCorrect );
	    penalties += wrongs.length;
	   correct++;
}
   console.log(correct + " " + penalties);
