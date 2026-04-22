/*
 * This JavaScript program defines a function 'Main'
 * that processes a given string 's' to count specific character mismatches.
 * It then reads input from the standard input stream and utilizes 'Main' for processing.
 *
 * This version includes extensive whitespace and comments for clarity,
 * but maintains exact functional equivalence to the original.
 */

function   Main   ( s )
{
    // Initialize the 'answer' variable to zero.
    // This variable will accumulate the count of mismatches.
    var   answer   =   0   ;


    // Calculate the 'half' point of the string length.
    // Math.ceil ensures that for odd-length strings, the middle character
    // is effectively part of the first half, so the loop starts correctly
    // for the 'second half' comparisons.
    const   half   =   Math . ceil ( s . length   /   2 ) ;


    /*
     * Begin a loop that iterates through the latter half of the string.
     * The loop variable 'i' starts from 'half' and goes up to (but not including)
     * the total length of the string 's'.
     */
    for   ( var   i   =   half ;   i   <   s . length ;   i ++ )
    {
        // Inside the loop, compare characters symmetrically.
        // s[s.length - i - 1] refers to the character at the corresponding position
        // from the beginning of the string, mirroring 's[i]'.
        // If these two characters are not identical, it indicates a mismatch.
        if   ( s [ s . length   -   i   -   1 ]   !==   s [ i ] )
        {
            // If a mismatch is detected, increment the 'answer' counter.
            answer ++ ;
        }
    }

    // After the loop completes, print the final count of mismatches to the console.
    console . log ( answer ) ;
}


// This section handles reading input for the 'Main' function.
// It uses Node.js's 'fs' module to synchronously read from '/dev/stdin' (standard input).
// The input is decoded as UTF-8 and any leading/trailing whitespace is removed using '.trim()'.
// Finally, the processed input string is passed as an argument to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . trim ( ) ) ;