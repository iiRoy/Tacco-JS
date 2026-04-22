function    main   (   input   )
{
    /*
     * This function processes a given input string.
     * It expects the input to be a series of numbers, separated by newlines.
     * The first line is typically a count, which is discarded.
     * The goal is to find pairs of numbers (args[i], args[j] where i < j)
     * such that their product, after scaling by 10^9, is divisible by 10^18.
     */

    // Declare a variable 'args' to store the processed input.
    // The input string is split into an array of strings by newline characters.
    let   args   =   input   .   split   (   '\n'   )   ;

    // The problem statement implies that the first element of the 'args' array
    // is often a metadata value (e.g., the number of elements) that should be ignored
    // for the actual calculation. Hence, it's removed using 'shift()'.
    args   .   shift   (   )   ;


    // Initialize a counter variable. This variable will hold the total number
    // of pairs that satisfy the specific condition defined later in the code.
    let   count   =   0   ;


    // Start of the primary loop. This loop iterates through each number in the
    // 'args' array, using 'i' as the index for the first element of a pair.
    for   (   let   i   =   0   ;   i   <   args   .   length   ;   i   ++   )
    {
        // Start of the secondary, nested loop. This loop iterates through the
        // numbers in 'args' that come *after* the current 'i' element.
        // This ensures that each pair (i, j) is unique and (j, i) is not re-evaluated.
        for   (   let   j   =   i   +   1   ;   j   <   args   .   length   ;   j   ++   )
        {
            // Calculate an intermediate 'result'.
            // Each number (args[i] and args[j]) is first multiplied by 1,000,000,000 (10^9).
            // These scaled values are then multiplied together.
            // This operation effectively computes (args[i] * args[j] * 10^18).
            let   result   =   (   args   [   i   ]   *   1000000000   )   *   (   args   [   j   ]   *   1000000000   )   ;

            // Check the divisibility condition.
            // If 'result' is perfectly divisible by (10^9 * 10^9), which is 10^18,
            // then the condition is met. The modulo operator '%' returns the remainder.
            // If the remainder is 0, it means 'result' is a multiple of 10^18.
            if   (   result   %   (   1000000000   *   1000000000   )   ==   0   )
            {
                // Increment the 'count' variable because a valid pair has been found.
                count   ++   ;
            }
        } // End of the inner loop (for 'j').
    } // End of the outer loop (for 'i').

    // After all possible pairs have been evaluated, print the final count
    // of valid pairs to the standard output.
    console   .   log   (   count   )   ;

} // End of the 'main' function definition.


// This line of code is responsible for executing the 'main' function.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string.
// The 'require('fs')' statement imports Node.js's file system module.
// The read content is then passed as the 'input' argument to the 'main' function.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of the JavaScript program.