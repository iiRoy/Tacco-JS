"use strict" /* This directive enforces strict mode for the entire script. */ ;


/**
 * Main function to process the input and calculate the result.
 * @param {string} input - The raw input string from stdin.
 */
function   Main   (   input   )
{

    // Pre-process the input string: trim whitespace and split into lines.
    input   =   input .   trim   (   ) .   split   (   '\n'   )   ;


    // Extract the first number, N, from the first line of input.
    const   N   =   Number   (   input   [   0   ] .   trim   (   )   )   ;


    /*
     * Process the second line of input:
     * - Trim whitespace.
     * - Split into an array of strings by space.
     * - Map each string to a number.
     * - Sort the array in descending order (b - a).
     */
    const   A   =   input   [   1   ]
                        .   trim   (   )
                        .   split   (   ' '   )
                        .   map   (   Number   )
                        .   sort   (   (   a   ,   b   )   =>   b   -   a   )   ;


    // Initialize a variable to store the accumulated result.
    let   ret   =   0   ;


    /*
     * Iterate through a specific range of the sorted array A.
     * The loop runs from index 1 up to (but not including) N * 3.
     */
    for   (   let   i   =   1   ;   i   <   N   *   3   ;   i   ++   )
    {
        // Check if the current index 'i' is an even number.
        if   (   i   %   2   ===   0   )
        {
            // If 'i' is even, add the element A[i] to the result.
            ret   +=   A   [   i   ]   ;
        }
    }


    // Output the final calculated result to the console.
    console   .   log   (   ret   )   ;

}


// Execute the Main function with input read from standard input.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;