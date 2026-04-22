/* This file enforces strict mode for better code quality */
'use strict'

/**
 * The main function processes the input and calculates the answer.
 *
 * @param {string} INPUT - The raw input string from stdin.
 */
const    main   =   ( INPUT   )   =>   {

    // Split the input string by newline, take the first line,
    // then split by space, and map each part to a number.
    const   input   =   INPUT .   split   (   '\n'   )   [   0   ]   .   split   (   ' '   )   .   map   (   n   =>   Number   (   n   )   )   ;


    // Extract individual values A, B, and C from the parsed input array.
    const   A   =   input   [   0   ]   ;
    const   B   =   input   [   1   ]   ;
    const   C   =   input   [   2   ]   ;

    /*
     * Declare a variable to store the final answer.
     * It will be assigned a value based on the conditional logic below.
     */
    let   ans   ;

    // Check the primary condition: Is C less than or equal to the sum of A and B?
    if   (   C   <=   A   +   B   )   {
        // If the condition is true, calculate ans as C + B.
        ans   =   C   +   B   ;
    }   else   {
        // Otherwise (C > A + B), calculate ans using a more complex formula.
        // This formula seems to adjust for the difference when C is larger.
        ans   =   (   C   +   B   )   -   (   C   -   B   -   A   )   +   1   ;
    }


    // Output the calculated answer to the console.
    console   .   log   (   ans   )   ;
}

// --- Program Execution Start ---
/*
 * Read input from standard input, decode it as UTF-8,
 * and then pass it to the main function for processing.
 */
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;