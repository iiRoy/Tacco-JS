/*
 * This JavaScript file implements a specific string matching algorithm.
 * It determines if the string 'keyence' can be formed by deleting
 * zero or more characters from the beginning and/or end of an input string `S`.
 *
 * This is a Type I clone, meaning its logic and structure are identical
 * to the original, with only variations in whitespace and comments.
 */

'use strict' ; // Enforce strict mode for cleaner code and better error handling.


/**
 * The primary function that processes the input string.
 *
 * @param { string } INPUT    -    The raw input received, typically from standard input.
 *                                  It is expected to contain the target string `S` on the first line.
 */
const    main    =    (    INPUT    )    =>    {

    // --- Variable Declarations and Initialization ---

    // Extract the actual string `S` from the first line of the `INPUT`.
    const    S    =    INPUT . split ( '\n' ) [ 0 ]    ;


    // Define the target string we are looking for.
    const    str    =    'keyence'    ;


    // Initialize the result variable. Assumed 'YES' until proven otherwise.
    let    ans    =    'YES'    ;


    // Index pointer for iterating through the `str` ('keyence').
    let    j    =    0    ;


    // Variable to store the index of the first character of a potential deletion block.
    // '-1' indicates no deletion block has started or is currently active.
    let    tmp    =    -1    ;


    // Loop counter for iterating through the input string `S`.
    let    i    =    0    ;


    // --- Main Logic: Character Matching Loop ---

    // Iterate through each character of the input string `S`.
    for    (    ;    i    <    S . length    ;    i ++    )    {

        // Compare the current character of `S` with the current character of `str`.
        if    (    S[i]    ==    str[j]    )    {

            // If the characters match, advance the pointer for `str`.
            j ++    ;

        }    else    {

            // If there's a mismatch:
            // Check for conditions that invalidate the 'keyence' formation.
            // This happens if `tmp` is not -1 (a deletion block has started)
            // AND the current mismatch is not immediately adjacent to the previous one.
            // This implies a non-contiguous deletion, which is not allowed.
            if    (    tmp    !=    -1    &&    tmp    +    1    !=    i    )    {

                // Set `i` to 0 (its value doesn't strictly matter after `break`, but for consistency).
                i    =    0    ;
                // Exit the loop immediately as the string cannot be formed.
                break    ;

            }


            // If this is the first mismatch, or a valid continuation of a deletion block,
            // record the current index `i` as the start of the deletion.
            tmp    =    i    ;

        }

    }


    // --- Final Check and Result Determination ---

    // After the loop, check two conditions:
    // 1. Was the entire 'keyence' string successfully matched (j reached str.length)?
    // 2. Did the loop complete iterating through the entire string `S` (i reached S.length)?
    // If either condition is FALSE, it means 'keyence' cannot be formed under the rules.
    if    (    j    !=    str . length    ||    i    !=    S . length    )    {

        // Set the answer to 'NO' because the conditions for 'YES' were not met.
        ans    =    'NO'    ;

    }


    // Output the final determined answer to the console.
    console . log ( ans )    ;

}    ;    // End of the 'main' function.


// --- Execution Block ---

// This line reads the entire content of standard input (e.g., from a file or pipe),
// decodes it as UTF-8, and then passes it as the `INPUT` argument to the `main` function.
main    (    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )    )    ;