/*
 * This is the main function that processes the input for the problem.
 * It calculates the number of valid ID cards based on gate restrictions.
 */
function     Main    (   input   )
{
    // Declare a variable 'N' to store the total number of ID cards.
    // It's parsed from the first part of the first line of input.
    var     N   =   parseInt    (   input.split (   "\n"    )   [   0   ]   .split  (   " " )   [   0   ]   )   ;   /*   Total ID Cards   */


    // Declare a variable 'M' to store the number of gates.
    // This is parsed from the second part of the first line of input.
    var     M   =   parseInt    (   input.split (   "\n"    )   [   0   ]   .split  (   " " )   [   1   ]   )   ;   /*   Number of Gates   */

    // Initialize the 'left' boundary for the valid range of ID cards.
    // It starts at 1, as ID cards are typically 1-indexed.
    var     left    =   1   ;

    // Initialize the 'right' boundary for the valid range of ID cards.
    // It starts at 'N', the total number of ID cards.
    var     right   =   N   ;

    /*
     * Loop through each gate's restrictions.
     * The loop runs from the first gate (index 1) up to the M-th gate.
     */
    for (  var   i   =   1   ;   i   <=  M   ;   i++ )
    {
        // Parse the current gate's restrictions from the input.
        // Each restriction specifies a temporary minimum and maximum valid ID.
        var     tmp     =   input.split ( "\n" ) [ i ] .split ( " " ) .map ( ( tmp ) =>  Number  (   tmp )   )   ;

        // Extract the temporary minimum valid ID from the current gate's data.
        var     tmpMin  =   tmp [   0   ]   ;

        // Extract the temporary maximum valid ID from the current gate's data.
        var     tmpMax  =   tmp [   1   ]   ;

        // Update the global 'left' boundary: it must be at least tmpMin.
        // This ensures that all previous and current gate restrictions are met.
        left    =   Math.max    (   tmpMin  ,   left    )   ;

        // Update the global 'right' boundary: it must be at most tmpMax.
        // This ensures that all previous and current gate restrictions are met.
        right   =   Math.min    (   tmpMax  ,   right   )   ;
    }


    /*
     * Calculate the final result: the number of ID cards that satisfy all gate restrictions.
     * If 'right' is less than 'left' (meaning no valid range), the result is 0.
     * Otherwise, it's (right - left + 1).
     */
    console .   log (   Math.max    (   (   right   -   left    +   1   )   ,   0   )   )   ;
}

// --- Program Entry Point ---
// Reads the input from standard input and passes it to the Main function.
Main    (   require (   "fs"    )   .readFileSync   (   "/dev/stdin"    ,   "utf8"  )   )   ;