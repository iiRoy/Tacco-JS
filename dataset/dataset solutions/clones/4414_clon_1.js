"use strict"
; /* This script strictly adheres to modern JavaScript standards. */

// This section defines the primary function responsible for processing input.
// The 'input' parameter is expected to contain the entire raw input data as a string.
const   main    =   (   input   )   =>
{
    // First, remove any leading/trailing whitespace from the input string.
    // Then, split the string into an array of individual characters.
    // Finally, destructure the first, second, and third characters into variables 'a', 'b', and 'c'.
    const   [   a   ,   b   ,   c   ]   =   input   .   trim   (   )   .   split   (   ""   )   ;

    // A conditional (ternary) operator is used here.
    // It checks if the character 'a' is strictly equal to the character 'c'.
    // If they are equal, the function returns the string "Yes".
    // Otherwise, it returns the string "No".
    return   a   ===   c   ?   "Yes"   :   "No"   ;
}
; /* End of the 'main' function definition. */


// -----------------------------------------------------------------------------
// PLEASE DO NOT MODIFY THE CODE BELOW THIS LINE.
// This part is responsible for handling standard input/output.
// It reads the entire content of standard input, then calls the 'main' function,
// and finally prints the result to the console.
// -----------------------------------------------------------------------------
console   .   log   (
    main   (
        require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )
    )
)   ; // Output the result of the main function to standard output.