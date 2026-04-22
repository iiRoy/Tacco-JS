'use strict' ; /* This directive enforces strict mode for the entire script. */


// This is an Immediately Invoked Function Expression (IIFE).
// It's a common pattern in JavaScript to create a private scope for variables.
( function (   input   ) {

    // --- Variable Declarations and Input Processing ---

    /*
     * Destructure the array returned by the input processing.
     * A, B, and K are expected to be numbers representing initial quantities.
     */
    const   [   A ,   B ,   K   ]   =   input
        .  trim  (  )           // First, remove any leading or trailing whitespace from the raw input string.
        .  split  (  ' '  )     // Then, split the cleaned string into an array of substrings using space as a delimiter.
        .  map  (  x   =>   x   -   0  )   ; // Finally, convert each substring (x) to a number by subtracting zero.
                                          // This is a concise way to perform type conversion to number.


    // --- Calculation of Remaining K ---

    /*
     * Calculate L, which represents the portion of K that could not be satisfied by A.
     * If K is less than or equal to A, then all of K is taken from A, and L becomes 0.
     * If K is greater than A, then A items are taken from K, and the remainder (K - A) is L.
     * Math.max(0, ...) ensures that L is never a negative value.
     */
    const   L   =   Math
        .  max  (
            0  ,              // The lower bound for L is zero.
            K   -   A         // Calculate the difference: K minus A.
        )   ;


    // --- Output Generation ---

    /*
     * Log the final result to the console.
     * The result is an array of two numbers, joined by a single space character.
     */
    console
        .  log  (
            [
                  Math . max (   A   -   K   ,   0   )  ,   // Calculate the remaining quantity of A.
                                                          // If A is less than K, it means A becomes 0.
                                                          // Math.max(0, ...) ensures the result is not negative.

                  Math . max (   B   -   L   ,   0   )     // Calculate the remaining quantity of B.
                                                          // L is the amount of K that needed to be taken from B.
                                                          // If B is less than L, it means B becomes 0.
                                                          // Math.max(0, ...) ensures the result is not negative.
            ]
                .  join  (   ' '   )                       // Concatenate the two calculated numbers with a space in between.
        )   ;

} ) (
    // --- Input Source ---

    /*
     * This part of the IIFE immediately executes the function with its argument.
     * The argument is the content read from '/dev/stdin' (standard input).
     * 'require('fs')' loads the Node.js file system module.
     * '.readFileSync' reads the file synchronously.
     * 'utf8' specifies the character encoding for the input.
     */
    require ( 'fs' )
        .  readFileSync (
            '/dev/stdin'  ,   // Specifies the path to the input file.
            'utf8'            // Specifies the encoding to use when reading the file.
        )
) ;

// End of the program.
/*
 * This script processes three space-separated integers from standard input: A, B, and K.
 * It models a resource allocation problem where K units are first consumed from resource A,
 * and any remaining units of K are then consumed from resource B.
 * The output is the final quantities of A and B, ensuring they are not negative.
 */