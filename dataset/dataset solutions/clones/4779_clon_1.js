/*
 * This file contains a Type I clone of a JavaScript program.
 * A Type I clone means the code fragments are exactly equal,
 * except for possible variations in whitespace and comments.
 *
 * This version aims to demonstrate significant visual differences
 * through extensive changes in indentation, spacing, and comments,
 * without altering the underlying logic, identifiers, or expressions.
 */
'use strict' /*
                * The 'use strict' directive enables strict mode.
                * This helps write cleaner, safer JavaScript by
                * preventing certain actions and throwing more errors.
                */


// This is the primary function of the program, named 'main'.
// It takes a single argument, 's', which is expected to be a string.
function    main    (   s   )
{
    // The input string 's' is processed here.
    // 1. It's split by newline characters, and the first line is selected.
    // 2. That line is then split by space characters.
    // 3. Each resulting string part is converted into a Number.
    // The result is an array of numbers, which overwrites the 's' variable.
    s   =   s   .   split   (   '\n'   )   [   0   ]   .   split   (   ' '   )   .   map   (   n   =>   Number   (   n   )   )   ;


    // Extract the first two numbers from the processed array 's'.
    // K represents the upper bound for x, y, and z.
    const       K       =       s   [   0   ]   ;
    // S represents the target sum that x + y + z should equal.
    const       S       =       s   [   1   ]   ;


    // Initialize a counter variable.
    // This variable will store the number of valid combinations (x, y, z).
    let         counter         =       0   ;


    // Start of the outer loop.
    // This loop iterates through possible values for 'x', from 0 up to K (inclusive).
    for     (   let     x   =   0   ;   x   <=   K   ;   x   ++   )
    {
        // Start of the inner loop.
        // This loop iterates through possible values for 'y', from 0 up to K (inclusive).
        for     (   let     y   =   0   ;   y   <=   K   ;   y   ++   )
        {
            // Calculate the value of 'z' such that x + y + z = S.
            // This is derived from the target sum S and the current x and y values.
            const       z       =       S   -   x   -   y   ;

            // Check if the calculated 'z' is within the allowed range [0, K].
            // If 'z' is less than 0 or greater than K, it's an invalid combination.
            // In such cases, the current iteration is skipped, and the loops proceed.
            if      (   z   <   0   ||   z   >   K   )
            {
                continue    ;   // Skip to the next iteration of the 'y' loop.
            }


            // This condition explicitly checks if the sum of x, y, and z equals S.
            // While 'z' is calculated to satisfy this, this check serves as an
            // explicit validation point (and adheres to Type I clone rules).
            if      (   (   x   +   y   +   z   )   ===   S   )
            {
                counter     +=      1   ;   // Increment the counter if the sum is correct.
            }
        }   // End of the inner loop for 'y'.
    }   // End of the outer loop for 'x'.


    // After all combinations have been checked, print the final count.
    // The 'counter' variable holds the total number of valid (x, y, z) triplets.
    console     .   log     (   counter   )   ;
}


// This is the entry point for the program execution.
// It reads data from standard input ('/dev/stdin') using Node.js's 'fs' module.
// The read data is expected to be UTF-8 encoded.
// The 'main' function is then called with this input string.
main    (   require     (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;