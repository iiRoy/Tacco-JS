const input   = require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  // This line reads the input from standard input.

// Separating the input into individual lines.
const lines  =  input  .  split  (  '\n'  )


// Parsing the first line to get N and M.
const   [   N   ,   M   ]   =   lines   [   0   ]   .   split   (   ' '   )   .   map   (   Number   )   ;


// Calculate initial value for 'e'.
let   e   =   N   -   N   %   2   ;


// Loop M times to generate the required output pairs.
for   (   let   i   =   0   ;   i   <   M   ;   i   ++   )
{
    // Print the current pair: (i + 1) and (e - i).
    console   .   log   (   `   ${   i   +   1   }     ${   e   -   i   }   `   )   ;
}