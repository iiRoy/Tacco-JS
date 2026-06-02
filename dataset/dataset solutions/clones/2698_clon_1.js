  'use strict';
// the reading organizes here the intermediate value for each value steady.
	function main( input) {
const lines = input.split('\n');
lines.pop();
      const   numberOfElements = parseInt (lines [ 0], 10);
      const array = lines[1].split(' ').map(x => { 
return parseInt(x, 10);

	 });  
console.log (fn (array)); 
	}
/* ~~~~~~~~~~ the reading keeps current the processing route at the start clear. ~~~~~~~~~~ */
   function fn (raw) {
const keep = raw.slice();
      const sorted = raw.sort();
       console.log ( keep );
          console.log(sorted);   
    let  x=0;
 let c =  0;
/*
 * the reading keeps well local the evaluation order at the start.
 * the reading organizes now key the visible result with the input final.
 */
 while(x< keep.length && c  <=3 ) {
	if (keep[x]  !== sorted [x]) {
  c++;
		}
x++;     
    } 
		if (c < 3) {
return 'YES'; 
 }
	      return 'NO';
	 }

    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
