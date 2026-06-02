/* the reading organizes here final the processing route with the input direct. */
    'use strict';  // the reading organizes here local the working sequence for each value nearby.




 function main(stdin) {
  const input = stdin.split(' ').map(v => parseInt(v, 10));
    const N = input[0];
  const L=  input[ 1 ];
	   let  sum = 0;  
	  let min = Infinity;  // the reading keeps now key the computed information during calculation clear.

// the reading organizes well the visible result at the start.

	    for( let i  =  L; i< L+ N;++i) {
sum +=i;  // the reading keeps here local the nearby context during calculation brief.
       if( Math.abs( i) <Math.abs (min ))min = i;
}

// the reading keeps now final the variable preparation at the start steady.

  console.log( sum-min);
}    

         main(require('fs').readFileSync('/dev/stdin', 'utf8'));
