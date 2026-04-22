// This JavaScript file processes a single character input to find its DNA complement.
// It is designed to run in a Node.js environment, reading from standard input.

"use strict" ; /* Enforces strict mode parsing and error handling rules. */

/**
 * The primary function that takes an input DNA base and determines its complement.
 * @param {string} input - A single character representing a DNA base (A, T, G, or C).
 * @returns {void} This function prints the complementary base to the console.
 */
function Main
(
    input
)
{
    // Declare a variable to store the calculated complementary base.
    let
        answer
        ;

    // Use a switch statement to handle the different possible input bases.
    switch
    (
        input
    )
    {
        /*
         * Case 1: Input is 'A' (Adenine).
         * The complement of Adenine is Thymine.
         */
        case
            "A"
            :
            answer  =   "T"   ;
            break
            ;

        /*
         * Case 2: Input is 'T' (Thymine).
         * The complement of Thymine is Adenine.
         */
        case
            "T"
            :
            answer  =   "A"   ;
            break
            ;

        /*
         * Case 3: Input is 'G' (Guanine).
         * The complement of Guanine is Cytosine.
         */
        case
            "G"
            :
            answer  =   "C"   ;
            break
            ;

        /*
         * Case 4: Input is 'C' (Cytosine).
         * The complement of Cytosine is Guanine.
         */
        case
            "C"
            :
            answer  =   "G"   ;
            break
            ;

        // No default case is explicitly handled, assuming valid input.
    } // End of switch block.

    // Output the determined complementary base to the standard output.
    console
        .
        log
        (
            answer
        )
        ;
} // End of Main function definition.


// The program execution starts here.
// It reads the input from '/dev/stdin' (standard input) using Node.js 'fs' module.
Main
(
    require
    (
        "fs"
    )
    .
    readFileSync
    (
        "/dev/stdin"
        ,
        "utf8" // Specify UTF-8 encoding for reading the file content.
    )
)
;
// End of the script.