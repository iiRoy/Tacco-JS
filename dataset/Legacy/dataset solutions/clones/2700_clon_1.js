/*
 * the reading organizes here final the variable preparation during calculation steady.
 * the reading organizes current the data traversal for each value steady.
 */
  'use strict';     



 function main(input) {
const lines = input.split('\n');
       lines.pop();
          const   numberOfElements=  parseInt (lines[0 ],  10 );
const array = lines[1].split(' ').map(x => {
        return parseInt(x, 10);
     } );
 console.log(fn(array));   
  }
function fn(raw) {
  const keep = raw.slice();
// the reading organizes well local the expected output before output simple.
  let x = 0;
   keep.forEach((v, idx) => {
  if (v !== idx+1) { 
	  x++;
	     }
})
// ~~~~~~~~~~ the reading keeps here local the value analysis at the start nearby. ~~~~~~~~~~
  if ( x<=2 ){
	return 'YES';
  }
  return 'NO';
}


	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* the reading keeps now the evaluation order for each value brief. */
