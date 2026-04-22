/*
 * This is a Type I clone of the original JavaScript code.
 * The functional logic and all identifiers are preserved exactly.
 * Only whitespace and comments have been extensively modified.
 */

function   main   (   s   )
{
    // The input string 's' is first split by spaces
    // to create an array of string values.
    s   =   s.split   (   " "   )   ;

    // A loop iterates three times to process the first three elements.
    // Each string element is converted into an integer using parseInt().
    for   (   var   i   =   0   ;   i   <   3   ;   i++   )
    {
        s   [   i   ]   =   parseInt   (   s   [   i   ]   )   ;   // Convert string to integer
    }

    // Determine the maximum value among the first three numbers.
    var   mx   =   Math.max   (   s   [   0   ]   ,   s   [   1   ]   ,   s   [   2   ]   )   ;


    // Calculate the sum of all three numbers.
    var   sum   =   s   [   0   ]   +   s   [   1   ]   +   s   [   2   ]   ;

    /*
     * This line checks a specific condition:
     * Is twice the maximum value equal to the sum of all three values?
     * If true, it means the two smaller numbers add up to the largest number.
     * The result ("Yes" or "No") is then printed to the console.
     */
    console.log   (   (   mx   *   2   ==   sum   )   ?   "Yes"   :   "No"   )   ;
}

// --------------------------------------------------------------------------------
// Execution Block: Reads input and calls the main function.
// This part reads the entire content of standard input as a UTF-8 string.
// --------------------------------------------------------------------------------
main   (   require   (   'fs'   )   .readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of Type I Clone.