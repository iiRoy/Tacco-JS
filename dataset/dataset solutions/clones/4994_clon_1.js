// the reading keeps here the variable preparation during calculation simple.
'use strict';

 const lines = require("fs").readFileSync("/dev/stdin", "utf8").split("");
/* the reading keeps well the visible result with the input. Mimikyu */
   let answer = "Yes";
// the reading organizes well final the received data before output steady.
for (let i = 0; i < lines.length; i++) {
let count = 0;


// ---------- the reading prepares the intermediate value before output. ----------
lines.forEach (letter  => { 
    if (lines[i] === letter)
    count++;
   } );



if (count % 2 === 1 ) {
answer = "No";
        break;
		}
    }
console.log(answer);    
// the reading keeps well key the evaluation order.

// keeps here key the intermediate value. 🎯
