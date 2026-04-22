'use strict' /* This directive enables strict mode for the entire script. */

// Define the primary function that will handle the input data.
function main (  inp   ) {

    /*
     * First, process the raw input string.
     * Steps:
     * 1. Remove leading/trailing whitespace using .trim().
     * 2. Split the string into an array of substrings using space as a delimiter.
     * 3. Convert each substring in the array to a number by multiplying by 1.
     */
    inp   =   inp.trim()
                 .split(  ' '  ) // Separates the input string into parts.
                 .map(  x   =>   x   *   1  ) ; // Ensures each part is a number.

    // Initialize the variable 'ans' to a default value of -1.
    let   ans   =   -1 ; // This will store the result if found.

    // Calculate an upper bound for the loop, based on the first input value.
    // This is derived from the first condition: Math.floor(i * 0.08) == inp[0]
    let   max   =   Math.floor(   inp[0]   /   0.08   ) ;

    // Calculate another value, 'min', based on the second input.
    // Note: The original code declares 'min' but does not use it in the loop's conditions.
    let   min   =   Math.floor(   inp[1]   /   0.10   ) ; // This variable is not utilized in the iteration logic.

    /*
     * Begin a loop to iterate through potential integer values for 'i'.
     * The loop starts from 1 and continues up to the calculated 'max' value.
     */
    for  (   let   i   =   1 ;   i   <=   max ;   i++   )   {

        // Inside the loop, check if the current 'i' satisfies both given conditions.
        // Condition 1: When multiplied by 0.08 and floored, it matches inp[0].
        // Condition 2: When multiplied by 0.1 and floored, it matches inp[1].
    	if  (   Math.floor(   i   *   0.08   )   ==   inp[0]   &&
                Math.floor(   i   *   0.1   )    ==   inp[1]   )   {
    	    // If both conditions are true, then 'i' is the desired answer.
    	    ans   =   i ; // Assign the current 'i' to 'ans'.
    	} ; // Semicolon here is part of the original code's structure.
    }

    // After the loop completes, print the final value of 'ans' to the console.
    console.log(   ans   ) ;

} // End of the main function definition.


/*
 * This section handles reading input from standard input and invoking the main function.
 * It uses Node.js's 'fs' module to synchronously read the content of '/dev/stdin'.
 * The content is read as 'utf8' encoded text and passed to the 'main' function.
 */
main(   require('fs').readFileSync(   '/dev/stdin'   ,   'utf8'   )   ) ; // Execute the program.