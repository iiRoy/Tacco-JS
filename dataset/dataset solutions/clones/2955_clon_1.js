/*
 * This file contains the solution for a date format problem.
 * It determines if a given 4-digit number represents a date in MMYY, YYMM, or AMBIGUOUS format.
 */

"use strict"; // Enforce strict mode for better code quality and error handling.

/**
 * The main function that processes the input and prints the result.
 * @param {string} input - A 4-digit string representing a potential date.
 */
function Main(  input )
{

    // Extract the first two digits and parse them as an integer.
    const first   =   parseInt(   input.slice(0, 2)   );

    // Extract the last two digits and parse them as an integer.
    const second  =   parseInt(   input.slice(2)      );

    // Check if the first two digits can represent a valid month (1-12).
    const firstMM =   0 < first  &&  first < 13;

    // Check if the last two digits can represent a valid month (1-12).
    const secondMM =  0 < second &&  second < 13;


    // --- Decision Logic ---

    // Case 1: Both parts can be valid months.
    if (   firstMM  &&  secondMM   )
    {
        // This situation is ambiguous, as it could be MMYY or YYMM.
        console.log(   'AMBIGUOUS'   );
        return; // Exit the function after printing.
    }
    // Case 2: Only the first part can be a valid month.
    else if (   firstMM   )
    {
        // The format must be MMYY.
        console.log(   'MMYY'   );
        return; // Exit the function.
    }
    // Case 3: Only the second part can be a valid month.
    else if (   secondMM   )
    {
        // The format must be YYMM.
        console.log(   'YYMM'   );
        return; // Exit the function.
    }

    // Case 4: Neither part can be a valid month.
    // This means the input does not fit any recognized date format.
    console.log(   'NA'   );
}


// --- Program Entry Point ---
// Read input from standard input and pass it to the Main function.
Main(   require("fs").readFileSync("/dev/stdin", "utf8")   );

// End of file.