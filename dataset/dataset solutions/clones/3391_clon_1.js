/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions
 *   are preserved exactly as they were in the original.
 * - Only whitespace (indentation, spacing, blank lines) and comments
 *   have been altered, added, or removed to create visual difference.
 */

"use strict"; // Enforces strict mode parsing and error handling in the script.

/**
 * Main function to process the input string and calculate the total flips required.
 *
 * @param {string} input - The input string representing a sequence of 'W' and 'B' characters.
 */
function         Main
    (
        input
    )
{
                                        // Initialize counters for flips and finished 'W's.
    let     flips           =   0,
            finishes        =   0
        ;

    // Iterate through each character of the input string.
    for (
            let     i       =       0
        ;
            i       <       input.length
        ;
            i++
        )
    {
        /*
         * If the current character is not 'W', it means it's 'B' (or any other character,
         * though 'B' is assumed in the problem context).
         * We are only interested in 'W's, so we skip to the next iteration.
         */
        if (
                input[i]
            !==
                'W'
            )
        {
            continue
            ;
        }

        // Calculate the number of flips needed for the current 'W'.
        // This 'W' is at index 'i', and 'finishes' represents the count
        // of 'W's already processed and moved to their final positions.
        // The difference (i - finishes) gives the number of positions this 'W'
        // needs to move left, which is equivalent to the number of flips.
        flips
            +=
                i
            -
                finishes
            ;

        // Increment the count of 'W's that have been conceptually moved to their final positions.
        finishes
            +=
                1
            ;
    }


    // Output the total number of flips calculated.
    console
        .
        log
            (
                flips
            )
    ;
}


// Read input from standard input and pass it to the Main function.
// This part handles the execution environment for competitive programming.
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
                    "utf8"
                )
    )
;