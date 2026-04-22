/* This is a Type I clone example.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered. */

// Enforce strict mode for better code quality.
"use strict"
;

// Define the main function to process input.
const   main    =   (   arg )   =>
{
        // Split the input by newline and take the first line as N.
        const   N   =   arg.split   (   "\n"    )   [   0   ]   ;

        // Calculate and print the Lucas number.
        console .   log (   lucasMaster (   N   )   )   ;
}
;

// Call the main function with input from standard input.
main    (   require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,   'utf8'  )   )   ;


// Function to calculate the N-th Lucas number.
function    lucasMaster (   n   )
{
    /* Initialize the answer array with the first two Lucas numbers: L_0 = 2, L_1 = 1.
     * This array will store all computed Lucas numbers up to N. */
    let answer  =   [   2   ,   1   ]   ;

    // Loop from the third number (index 2) up to N.
    for
    (
        let i   =   2   ;
        i   <=  n   ;
        i   ++
    )
    {
        // Calculate the next Lucas number using the sum of the previous two.
        // L_i = L_{i-2} + L_{i-1}
        answer  .   push    (   answer  [   i   -   2   ]   +   answer  [   i   -   1   ]   )   ;
    }

    // The N-th Lucas number is the last element added.
    // The .pop() method removes and returns the last element.
    return  answer  .   pop (   )   ;
}