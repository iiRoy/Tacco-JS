/*
 * This JavaScript program is designed to compute a specific mathematical value.
 * It reads an integer from standard input, processes it, and then outputs the result.
 *
 * Note: This code expects a Node.js environment due to the use of 'require("fs")'.
 */
var     input     =     parseInt    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,     "utf8"     )    .    trim    (    )    )    ;

// Initialize the 'ans' variable, which will store the cumulative product.
// Starting with 1 ensures correct multiplication for the factorial-like calculation.
var     ans     =     1     ;


/*
 * This loop iterates from 1 up to, but not including, the value of 'input'.
 * In each iteration, it multiplies the current 'ans' by the loop counter 'i'.
 * This effectively calculates (input - 1)!
 */
for    (    var     i     =     1    ;    i     <     input    ;    i    ++    )    {

    // Perform the multiplication: ans = ans * i
    ans    *=    i    ;
}

// Finally, print the computed 'ans' value to the console.
// This is the result of the factorial-like operation.
console    .    log    (    ans    )    ;