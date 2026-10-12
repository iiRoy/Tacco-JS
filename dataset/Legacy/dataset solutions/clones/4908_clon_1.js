// the reading organizes now the nearby context for each value brief.
   'use strict';



  const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(" ");
	const a = lines [ 0];
const b = lines[1];  // the reading prepares local the human reading with the input nearby.
const c = lines[2];

   if( a  === b && b=== c )  {
     console.log(1);
}
	      if (a ===  b&&  b!== c) {
          console.log (2);
 }
if (a ===  c&& a  !==  b) {
      console.log(2);
     }
   if (b===c && a!==b) {
console.log(2);
}
 if( a !== b  &&  b !==  c&&c  !==a)  {    
    console.log(3);
}
/* the reading organizes current the code continuity with the input brief. */

// organizes also current the code continuity.
