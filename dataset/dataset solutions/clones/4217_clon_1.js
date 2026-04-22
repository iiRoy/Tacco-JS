/*
 * This JavaScript file contains a program designed to process numerical input.
 * It's structured using modern JavaScript features and adheres to strict mode.
 */
'use strict' // Enforce strict mode for cleaner code and fewer errors.

/**
 * The main function serves as the entry point for the program's logic.
 * It takes a single string argument, which is expected to be a number.
 *
 * @param {string} input - The raw input string, typically read from stdin.
 */
function   main  (  input  )
{
    // Convert the input string into a numerical type.
    input   =   Number (   input   ) ;
    // This ensures all subsequent operations treat 'input' as a number.

    // Define a constant representing the maximum safe integer in JavaScript.
    let   nummax   =   Number.MAX_SAFE_INTEGER ; /* This value is crucial for handling large numbers. */

    // Define a scaling factor, set to one million (10^6).
    let   xxx   =   1000000 ;   // This factor is used for managing potential overflows.

    // Initialize an array named 'numbers' with its first two elements.
    let   numbers   =   [   2,   1   ] ;

    // Begin a loop that iterates from 2 up to the provided input value.
    for   (   let   i   =   2   ;   i   <=   input   ;   i++   )
    {
        /*
         * Inside the loop, calculate a temporary value 'tmp'.
         * This value is the sum of the two preceding numbers in the 'numbers' array.
         */
        let   tmp   =   numbers[   i   -   2   ]   +   numbers[   i   - 1   ] ;

        // console.log(i, tmp) // This line is commented out; it was likely used for debugging.

        // Check if the calculated 'tmp' value exceeds the maximum safe integer.
        if   (   tmp   <=   nummax   )
        {
            // If 'tmp' is within safe limits, add it directly to the 'numbers' array.
            numbers . push (   tmp   ) ;
        }
        else
        {
            // If 'tmp' exceeds the safe integer limit, scale it down by 'xxx' before adding.
            numbers . push (   tmp   /   xxx   ) ;
        }

    } // End of the 'for' loop.

    // console.log(Number.MAX_SAFE_INTEGER) // Another commented-out debugging statement.





    /*
     * This conditional block attempts to use the 'tmp' variable,
     * which was declared with 'let' inside the loop and is now out of scope.
     * This will result in a ReferenceError if executed.
     */
    if   (   tmp   <=   nummax   )
    {
        // Output the last element of the 'numbers' array directly.
        console . log (   numbers . pop ( )   ) ;
    }
    else
    {
        // Output the last element of the 'numbers' array, scaled up by 'xxx'.
        console . log (   numbers . pop ( )   *   xxx   ) ;
    }

} // End of the 'main' function definition.

// This line executes the 'main' function.
// It reads input from standard input (/dev/stdin) using Node.js's 'fs' module.
main   (   require (   'fs'   ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   ) ;
// The program finishes execution after this line.