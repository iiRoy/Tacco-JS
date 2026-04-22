/*
 * This is a Type I clone generated from an existing JavaScript snippet.
 * All variable names, function names, operators, and expressions
 * are preserved exactly as in the original source.
 * Only whitespace and comments have been altered significantly.
 */

'use strict' // Enforce strict parsing and error handling for the entire script.

// Define the primary function responsible for processing the program's input.
const main = ( input ) =>
{

    // Process the raw input: first split by newlines to get individual lines,
    // then map each line to an array of strings by splitting it by spaces.
    const   args    =   input   .   split   (   '\n'    )   .   map   (   arg   =>   arg   .   split   (   ' '   )   )   ;

    // Extract the first numerical value from the first line of arguments.
    // Convert it to an integer using base 10. This represents value A.
    const   A   =   parseInt   (   args   [   0   ]   [   0   ]   ,   10   )   ;

    // Extract the second numerical value from the first line of arguments.
    // Convert it to an integer using base 10. This represents value B.
    const   B   =   parseInt   (   args   [   0   ]   [   1   ]   ,   10   )   ;

    // Extract the third numerical value from the first line of arguments.
    // Convert it to an integer using base 10. This represents value X.
    const   X   =   parseInt   (   args   [   0   ]   [   2   ]   ,   10   )   ;

    // Evaluate the given condition:
    // Is A less than or equal to X, AND is the sum of A and B greater than or equal to X?
    if   (   A   <=   X   &&   A   +   B   >=   X   )   {
        // If both parts of the condition are true, output 'YES'.
        console   .   log   (   'YES'   )   ;
    }
    else   {
        // Otherwise, if the condition is not fully met, output 'NO'.
        console   .   log   (   'NO'   )   ;
    }

} // End of the main function definition.


// The script execution starts here.
// It reads the entire content of standard input,
// decodes it as UTF-8, and passes it to the 'main' function for processing.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// This concludes the program's execution flow.