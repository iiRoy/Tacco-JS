// This JavaScript program calculates a specific sum based on an integer input.
// It demonstrates a Type I code clone, preserving all logic and identifiers.


    var     fs      =   require (   "fs"    )   ;   // Import the built-in 'fs' module for file system operations.

    /*
     * Read the entire content of standard input.
     * The input is expected to be a single numerical value.
     */
    var line    =   fs  .  readFileSync (   "/dev/stdin"    )   ;

    // Convert the input line (which is a Buffer or string) into a numerical type.
    var     N   =   Number  (   line    )   ;

    // Initialize the result variable to store the accumulated sum.
    var     res     =   0   ;


    // Begin the main loop, iterating from 1 up to N, inclusive.
    for     (   var     i   =   1   ;   i   <=  N   ;   i++     )   {
        // Calculate 'n', which represents the integer part of N divided by 'i'.
        var     n   =   Math.floor  (   N   /   i   )   ;

        // Add a calculated term to the total result.
        // The term is based on the formula for the sum of an arithmetic series: n * (n + 1) / 2,
        // multiplied by 'i', and then floored.
        res     +=  Math.floor    (   i   *   n   *   (   n   +   1   )   )   /   2   ;
    }   // End of the primary calculation loop.


    // Output the final computed result to the standard output console.
    console .   log (   res )   ;

    // End of the script execution.