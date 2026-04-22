/*
 * This file processes input data.
 * The Main function is the entry point for handling the input.
 */

function   Main   (   input   )
{
    // Declare a variable to hold lines from the input.
    // The input string is split by newline characters.
    var   line   =   input .   split   (   "\n"   )   ;

    // A temporary array to store the first line's components.
    var   tmp   =   line   [   0   ] .   split   (   " "   )   ;

    // Extract the lower bound from the first component of the temporary array.
    var   lower   =   Number   (   tmp   [   0   ]   )   ;

    // Extract the upper bound from the second component of the temporary array.
    var   upper   =   Number   (   tmp   [   1   ]   )   ;


    // Calculation of the answer:
    // We are looking for 'x' such that: lower * 2^(x-1) = upper
    // This can be rewritten as: 2^(x-1) = upper / lower
    // Taking log base 2 on both sides: x-1 = Log2(upper / lower)
    // So, x = Log2(upper / lower) + 1
    // The result should be an integer, so we floor the Log2 part.
    var   ans   =   Math .   floor   (   Math .   Log2   (   upper   /   lower   )   )   +   1   ;

    // Output the calculated answer to the console.
    console .   log   (   ans   )   ;
}

// --- DO NOT MODIFY THE FOLLOWING LINES ---
// These lines handle reading input from stdin and calling the Main function.

Main   (   require   (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;