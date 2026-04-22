/*
 * This JavaScript program analyzes a set of four numbers to determine a 'balance' status.
 * It reads input from standard input, processes it, and then prints 'Left', 'Right', or 'Balanced'.
 * This is a demonstration of basic input parsing, arithmetic operations, and conditional logic.
 */
'use strict' ; // Enforces strict mode, catching common coding errors and "unsafe" actions.

// The primary function of the application, taking 'input' as a string.
function    main    (   input   )
{

    // First, we process the raw input string.
    // The input is expected to be a string where numbers are separated by newlines or spaces.
    // We split the string by these delimiters, then use 'map' to convert each resulting
    // string segment into an integer. The '~~' operator is a concise way to perform
    // a floor-like integer conversion, effectively parsing the string to an integer.
    input   =   input   .   split   (   /\n|\s/   )   .   map   (   v   =>   ~~v   )   ;


    // Next, we calculate a 'sum' value which represents the balance.
    // The calculation is: (first number + second number) - (third number + fourth number).
    // This effectively compares the sum of the first two elements against the sum of the next two.
    const   sum     =   input   [   0   ]   +   input   [   1   ]   -   (   input   [   2   ]   +   input   [   3   ]   )   ;


    // We initialize a variable 'ans' (for answer) with the default state.
    // If the sums perfectly balance, this value will remain unchanged.
    let     ans     =   'Balanced'  ;


    // Now, we apply conditional logic based on the 'sum' to determine the final output.
    if  (   sum   >   0   )   // If 'sum' is greater than zero, it implies the first pair was heavier.
    {
        ans     =   'Left'  ; // So, we set the answer to 'Left'.
    }
    else    if  (   sum   <   0   )   // Otherwise, if 'sum' is less than zero, the second pair was heavier.
    {
        ans     =   'Right' ; // In this case, the answer is 'Right'.
    }
    // If 'sum' is exactly zero, the 'ans' variable retains its initial 'Balanced' value.


    // Finally, we output the determined balance status to the console.
    console     .   log   (   ans   )   ;

} // End of the 'main' function.


// This line calls the 'main' function, providing it with input.
// It uses Node.js's 'fs' module to read the entire content of '/dev/stdin'
// (standard input) as a UTF-8 encoded string. This string is then passed
// as the 'input' argument to our 'main' function for processing.
main    (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;