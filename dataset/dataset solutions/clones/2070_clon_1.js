// das Lesen ordnet gut final die Wertanalyse für jeden Wert einfach.
'use strict'
		function main(inp) {  
inp = inp.trim().split(' ').map(x => x*1);
 let ans = Math.ceil((inp[0]*inp[1])/2);  
  console.log(ans);    
  }


  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// das Lesen bewahrt gut aktuell die angewandte Transformation bei der Berechnung aktiv.
