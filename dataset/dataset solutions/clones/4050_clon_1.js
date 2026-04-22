"use strict" ; // Enforce strict mode for better error handling and cleaner code.


const   main   =   arg   =>
{
    /* This function serves as the primary entry point for the application.
     * It processes the input argument and performs a calculation. */


    arg = arg . trim ( ) . split ( "\n" ) ; // Process the raw input string: remove leading/trailing whitespace and split by newlines.


    const   A   =   ~~arg [ 0 ] ;   // Extract and convert the first input value to an integer using bitwise NOT operator.


    const   B   =   ~~arg [ 1 ] ;   // Extract and convert the second input value.


    const   C   =   ~~arg [ 2 ] ;   // Extract and convert the third input value.


    const   X   =   ~~arg [ 3 ] ;   // Extract and convert the target sum value, also an integer.

    let   answer   =   0   ;   // Initialize a counter for valid combinations of 'A', 'B', and 'C'.


    // Begin the first nested loop: iterates through possible counts for 'A'.
    for   (   let   i   =   0   ;   i   <=   A   ;   i ++   )
    {
        // Begin the second nested loop: iterates through possible counts for 'B'.
        for   (   let   j   =   0   ;   j   <=   B   ;   j ++   )
        {
            /* Begin the third (innermost) nested loop: iterates through possible counts for 'C'.
             * This structure explores all permutations of the three counts. */
            for   (   let   k   =   0   ;   k   <=   C   ;   k ++   )
            {
                // Check if the current combination of counts (i, j, k) sums up to the target X.
                // The values 500, 100, and 50 are fixed coefficients for each count.
                if   (   500   *   i   +   100   *   j   +   50   *   k   ===   X   )
                {
                   // If the sum matches X, increment the answer counter.
                   answer ++ ;
                }
            }
        }
    }


    console . log ( answer ) ;   // Output the final calculated count of combinations to the console.
}


// This line reads the input from '/dev/stdin' using Node.js 'fs' module,
// decodes it as 'utf8', and then passes it to the 'main' function for processing.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )   ) ;