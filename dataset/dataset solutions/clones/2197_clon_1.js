function main ( input )
{
    /* Initialize H by parsing the input string. */
    H   =   parseInt (   input   )   ;

    // Set initial values for count and out.
    count   =   1   ;
    out     =   1   ;

    // Start an infinite loop that will be broken conditionally.
    while   (   true   )
    {
        H   =   H   /   2   ;   // Halve the value of H.

        /*
         * Check if H has fallen below 1.
         * If so, the calculation is complete.
         */
        if   (   H   <   1   )
        {
            break   ;   // Exit the loop.
        }

        // Double the count for the next iteration.
        count   =   count   *   2   ;

        // Accumulate the count into out.
        out     =   out   +   count   ;
    }

    // Output the final calculated value to the console.
    console .   log   (   out   )   ;
}

/*
 * This line reads the input from standard input
 * and passes it to the main function.
 */
main   (   require (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;