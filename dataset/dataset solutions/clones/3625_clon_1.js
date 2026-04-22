/*
 * This JavaScript file implements a solution for converting a decimal number
 * to its base -2 (negabase) representation.
 * It reads input from standard input, processes it, and prints the result.
 */

"use strict" ; // Enable strict mode for better code quality and error handling.


/**
 * The primary function responsible for handling the program's logic.
 * It takes the entire input string as an argument.
 *
 * @param   { string }   input   The raw string content read from standard input.
 * @returns { void }             This function prints its output directly to the console.
 */
function   Main (   input   )
{
    // Step 1: Parse the input.
    // The input string is split into an array of lines.
    let   lines   =   input .   split (   "\n"   ) ;

    // Step 2: Extract the number to be converted.
    // The first line is shifted off, then split by any whitespace,
    // and the first resulting part is taken as the number string.
    let   n   =   lines .   shift (   ) .   split (   /\s/   ) [   0   ] ;

    // Convert the string 'n' into a numerical integer 'N'.
    let   N   =   Number (   n   ) ;


    // Initialize an empty string that will store the base -2 representation.
    // The digits will be prepended to this string.
    let   ans   =   ""   ;

    // Step 3: Core conversion loop (Base -2 algorithm).
    // The loop continues as long as N is not zero.
    while   (   N   !=   0   )
    {
        // Check if the current number N is odd.
        if   (   N   %   2   !=   0   )
        {
            // If N is odd, we append '1' to our answer (prepending actually).
            // Then, we adjust N by decrementing it.
            N   --   ;
            ans   =   "1"   +   ans   ;
        }
        else
        {
            // If N is even, we append '0' to our answer.
            ans   =   "0"   +   ans   ;
        }

        // Divide N by -2 for the next iteration.
        // This is the fundamental operation for negabase conversion.
        N   /=   -2   ;
    }

    // Step 4: Handle the edge case where the initial input N was 0.
    // If 'ans' is still empty, it means N was 0, so the base -2 representation is "0".
    if   (   ans   ==   ""   )
    {
        ans   =   "0"   ;
    }

    // Step 5: Output the final result.
    console .   log (   ans   ) ;
}


// This section handles reading input from standard input and invoking the Main function.
// It uses Node.js's 'fs' module to read the entire file synchronously.
Main   (   require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   ) ;

// End of program execution.