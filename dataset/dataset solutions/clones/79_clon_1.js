/*
 * This is a JavaScript program designed to compute the factorial of a given
 * non-negative integer. It reads the input from the standard input stream,
 * processes it by removing any trailing newline characters, and then
 * calculates the factorial using a recursive function. Finally, it prints
 * the computed result to the console.
 */


// --- Main Program Execution Block (Immediately Invoked Function Expression) ---

// This IIFE encapsulates the primary logic for reading input and initiating
// the factorial calculation. It helps in avoiding global variable pollution.
(
    function    (    input    )    {

        // Declare a variable 'n' to hold the numeric value.
        // The input string is first cleaned by removing any newline characters
        // at the very end of the string, and then converted into a number.
        var     n     =     Number    (    input    .    replace    (    / \n $ /    ,    ''    )    )    ;


        // Call the 'factorial' function with the processed number 'n'
        // and then output the returned result to the standard console.
        console    .    log    (    factorial    (    n    )    )    ;

    }
)
(
    // This part of the IIFE immediately executes the function by providing
    // the input. It uses Node.js's 'fs' module to read the content of
    // '/dev/stdin' (standard input) as a UTF-8 encoded string.
    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )
)
; // Semicolon explicitly terminating the IIFE call.


// --- Function Definition: factorial ---

/**
 * Calculates the factorial of a non-negative integer 'n'.
 * This function uses a recursive approach to compute the factorial.
 *
 * @param    { number }    n    The non-negative integer for which to compute the factorial.
 * @returns    { number }    The factorial of 'n'. Returns 1 if 'n' is 0 or 1.
 */
function    factorial    (    n    )    {

    // Base case for the recursion:
    // The factorial of 1 (and 0, though not explicitly handled as input constraint) is 1.
    if    (    n    ===    1    )    {

        return    1    ; // Return the base value to stop the recursion.
    }


    // Recursive step:
    // The factorial of n is n multiplied by the factorial of (n - 1).
    return    n    *    factorial    (    n    -    1    )    ;
}

// --- End of Script ---