/*
 * This JavaScript file processes input data to calculate modified times.
 * It's structured to read specific patterns from standard input, perform
 * arithmetic operations based on these patterns, and then print the results.
 * This program is designed for a competitive programming context or similar
 * data transformation tasks.
 *
 * Created by: A Code Cloning System
 * Date of Generation: [Insert Current Date Here]
 */

'use strict' ; // Enforces stricter parsing and error handling for cleaner code.

// The primary entry point function that encapsulates the core logic.
function Main (   input   ) {
    // Split the entire input string into an array of lines.
    // Each element in 'tmp' will correspond to a line from the input.
    const   tmp   =   input   .   split   (   '\n'   )   ;


    // The first line of input is typically 'N', representing the number of items.
    const   N   =   tmp   .   shift   (   )   ;

    // The second line contains space-separated values, 'T', which are base times.
    // These are parsed into an array of numbers.
    const   T   =   tmp   .   shift   (   )   .   split   (   ' '   )   .   map   (   v   =>   Number   (   v   )   )   ;

    // The third line is 'M', representing the number of modification operations.
    const   M   =   tmp   .   shift   (   )   ;

    // The remaining lines in 'tmp' represent the actual modifications, 'PX'.
    // Each modification is an array of two numbers: [index, new_value].
    const   PX   =   tmp   .   map   (   v   =>   v   .   split   (   ' '   )   .   map   (   v   =>   Number   (   v   )   )   )   ;

    // The original code had a debugging console.log here, which has been removed
    // as part of comment/whitespace modification for Type I cloning.
    // console.log(N, T, M, PX); // This line is often used for initial data verification.


    // Initialize a variable to hold the sum of all default times from array T.
    let   defaltTime   =   0   ;

    // Loop through each value in the 'T' array to calculate the total default time.
    for   (   const   v   of   T   )   {
        defaltTime   +=   v   ; // Accumulate the sum.
    }

    // Create an empty array to store the results of each modification calculation.
    const   result   =   [   ]   ;

    // Iterate over each modification instruction provided in the 'PX' array.
    for   (   const   v   of   PX   )   {
        // 'v[0]' is a 1-based index for an item in 'T'.
        // 'v[1]' is the new time value for that item.
        // Calculate the difference between the original time and the new time.
        const   diff   =   T   [   v   [   0   ]   -   1   ]   -   v   [   1   ]   ;

        // The modified total time is the default total time minus the calculated difference.
        const   time   =   defaltTime   -   diff   ;

        // Add the computed modified time to our results array.
        result   .   push   (   time   )   ;
    }

    // Finally, iterate through the 'result' array and print each calculated time.
    // Each time is printed on a new line to standard output.
    for   (   const   v   of   result   )   {
        console   .   log   (   v   )   ;
    }

}

// This line reads the entire content of standard input (typically '/dev/stdin' in Unix-like systems)
// as a UTF-8 encoded string and passes it to the 'Main' function for processing.
Main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of the JavaScript program.