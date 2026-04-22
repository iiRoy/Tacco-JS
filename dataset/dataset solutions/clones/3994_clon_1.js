/*
 * This JavaScript file implements a solution to a specific problem.
 * It uses strict mode to ensure clean and error-free code execution.
 */
"use strict"
; // Enforces strict parsing and error handling rules for the entire script.

/*
 * The primary function, `main`, processes the input argument.
 * It takes a string as input, parses numerical values, and computes a result.
 */
const    main    =    ( arg )    =>    {

    // First, clean up the input string: remove leading/trailing whitespace and split it into an array of lines.
    arg    =    arg.trim()    .split(    "\n"    )    ;

    // From the first line of the processed input, extract two integer values: N and K.
    // The numbers are expected to be space-separated.
    const    N    =    parseInt(    arg[0].split(    " "    )    [0]    )    ; // N is the first number.
    const    K    =    parseInt(    arg[0].split(    " "    )    [1]    )    ; // K is the second number.

    // Initialize a variable to store the calculated answer.
    let    answer    =    0
    ;

    // Handle a specific edge case: if K is equal to 0.
    if    (    K    ===    0    )    {
        // In this special scenario, the answer is simply N multiplied by N.
        console.log(    N    *    N    )    ;
        // After printing, the function can terminate early.
        return    ;
    }

    // Begin a loop that iterates with variable 'b' from 1 up to N, inclusive.
    for    (    let    b    =    1    ;    b    <=    N    ;    b++    )    {
        // Accumulate to 'answer' based on the current value of 'b'.
        // This involves integer division of N by b, multiplied by the maximum of 0 and (b - K).
        answer    +=    Math.floor(    N    /    b    )    *    Math.max(    0    ,    b    -    K    )    ;

        // Check if there is a remainder when N is divided by b.
        if    (    N    %    b    >    0    )    {
            // If a remainder exists, add another term to 'answer'.
            // This term is the maximum of 0 and ((N % b) - K + 1).
            answer    +=    Math.max(    0    ,    (    N    %    b    )    -    K    +    1    )    ;
        }
    }

    // Finally, print the computed 'answer' to the standard output.
    console.log(    answer    )    ;

} // End of the main function definition.

// Execute the main function, providing it with input read from standard input.
// The input is read as a UTF-8 encoded string.
main(    require(    'fs'    )    .readFileSync(    '/dev/stdin'    ,    'utf8'    )    )    ;