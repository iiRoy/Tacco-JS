/*
 * This JavaScript file demonstrates a solution
 * for a combinatorics problem, reading input
 * from standard input and producing output.
 * It's structured with a function to handle input
 * and a main processing block using the 'every' method.
 */
function   stdin   (   )
{
    // Declare a variable 'stdin' to hold the content read from the file system.
    // The 'require' function is used to import the 'fs' (file system) module.
    var   stdin   =   require   (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ;

    // The read content is then split into an array of lines.
    // The regular expression /\n\r?/ handles both Unix-style (\n) and Windows-style (\r\n) newlines.
    return   stdin .   split   (   /\n\r?/   )   ;

}   /* End of the 'stdin' function definition */


// Call the 'stdin' function to get the array of input lines.
// Then, iterate over each line using the 'every' array method.
// The 'every' method continues as long as the callback returns a truthy value.
stdin   (   ) .   every   (   function   (   line   )
{
    /*
     * Inside this anonymous callback function, we process each 'line'.
     * We'll parse numerical values N and X, and initialize a counter 'c'.
     */
    var   tmp   =   line .   split   (   ' '   )   ,   // Split the current 'line' by space to get an array of string parts.

        N     =   +   tmp   [   0   ]   ,             // Convert the first part (at index 0) to a number and assign it to N.
                                                // The unary '+' operator is used for type coercion.

        X     =   +   tmp   [   1   ]   ,             // Convert the second part (at index 1) to a number and assign it to X.

        c     =   0   ;                           // Initialize the counter 'c' to zero. This counter will store the number of valid triplets.

    /*
     * Begin a series of nested loops to find combinations of three unique numbers (i, j, k)
     * such that their sum equals X.
     * The numbers i, j, k are chosen from the range [1, N].
     */
    for   (   var   i   =   1   ;     i   <=   N   ;     i   ++   )   // Outer loop: 'i' iterates from 1 to N, inclusive.
    {

        // Add some extra blank lines for visual separation and readability.


        for   (   var   j   =   i   ;     j   <=   N   ;     j   ++   )   // Middle loop: 'j' iterates from 'i' to N.
        {
            // This condition ensures 'j' is strictly greater than 'i' for unique triplets.
            if   (   j   ==   i   )     continue   ; // If j is the same as i, skip to the next iteration of the 'j' loop.


            for   (   var   k   =   j   ;     k   <=   N   ;     k   ++   )   // Inner loop: 'k' iterates from 'j' to N.
            {
                // This condition ensures 'k' is strictly greater than 'j' and 'i' for unique triplets.
                if   (   k   ==   j     ||     k   ==   i   )     continue   ; // If k is the same as j or i, skip to the next iteration of the 'k' loop.

                /*
                 * Check if the sum of 'i', 'j', and 'k' is strictly equal to 'X'.
                 * The '===' operator performs a strict equality comparison (value and type).
                 * The '!!' (double negation) converts the boolean result of the comparison (true/false)
                 * into its corresponding numeric value (1 for true, 0 for false).
                 * This result is then added to the counter 'c'.
                 */
                c   +=   ! !   (   i   +   j   +   k   ===   X   )   ;

            }   // End of the inner loop for 'k'

            // Yet another blank line for visual separation.


        }   // End of the middle loop for 'j'


    }   // End of the outer loop for 'i'

    /*
     * The final return statement for the 'every' callback.
     * This uses a ternary operator for conditional logic.
     *
     * Condition: '!N && !X'
     *  - If N is falsy (e.g., 0) AND X is falsy (e.g., 0), it means the input line was "0 0".
     *
     * If true: 'false' is returned.
     *  - Returning 'false' from 'every' immediately stops the iteration.
     *  - This is a common pattern to signal the end of input or processing.
     *
     * If false: '!console.log(c)' is executed.
     *  - 'console.log(c)' prints the calculated count 'c' to the standard output.
     *  - 'console.log' typically returns 'undefined'.
     *  - '!undefined' evaluates to 'true'.
     *  - Returning 'true' from 'every' allows the iteration to continue to the next line.
     */
    return   !   N     &&     !   X     ?     false     :     !   console .   log   (   c   )   ;

}   )   ;   // End of the 'every' method call and its callback function.

/*
 * This entire script is intended to be executed in an environment
 * that supports Node.js-style modules (like 'require') and console output.
 */