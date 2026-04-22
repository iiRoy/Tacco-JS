/*
 This is a Type I clone of the original JavaScript code.
 This clone maintains exact logical and structural equivalence
 while extensively modifying whitespace and comments.
 No identifiers, operators, or expressions have been altered.
*/

// Initialize the readline interface for standard input/output operations.
require ( 'readline' ) . createInterface ( {
        // Configure input stream to be the standard input.
        input  :  process . stdin  ,
        // Configure output stream to be the standard output.
        output :  process . stdout
    } )
    // Attach an event listener for each 'line' received from input.
    . on ( 'line' , onReadLine ) ;


// Declare a control flag, initialized to 'false'.
// This flag is used to skip the first line of input.
var   flag   =   false   ;


/**
 * Processes each line read from the standard input.
 * The first line is intentionally skipped using a flag.
 *
 * @param {string} line - The current line of text read from input.
 */
function   onReadLine ( line )   {

    // Toggle the 'flag' and check its new state.
    // If 'flag' becomes true (meaning it was false before), skip this iteration.
    // This effectively skips the very first line of input.
    if   (   (   flag   =   !   flag   )   )
    {
        return   ;
    }

    // Parse the input line: split by space, then convert each part to an integer.
    const   nums   =   line . split ( ' ' ) . map (   i   =>   parseInt (   i   )   )   ;

    // Call the 'check' function with the parsed numbers to determine gradient signs.
    const   grads   =   check (   ...   nums   )   ;

    // Call the 'count' function to process the gradient signs and get a result.
    const   result   =   count (   1   ,   ...   grads   )   ;

    // Output the final computed result to the console.
    console . log (   result   )   ;

}


/**
 * Recursively checks the relationship (gradient sign) between consecutive numbers.
 * It returns an array of -1, 0, or 1 based on whether a number is less than,
 * equal to, or greater than the next number, respectively.
 * An empty array is returned if an invalid comparison (NaN) occurs.
 *
 * @param {number} a - The current number.
 * @param {number} b - The next number for comparison.
 * @param {Array<number>} next - Remaining numbers in the sequence.
 * @returns {Array<number>} An array of gradient signs.
 */
function   check (   a   ,   b   ,   ...   next   )   {

    // Determine the sign of the difference between b and a.
    // -1 if b < a, 0 if b == a, 1 if b > a.
    const   sign   =   Math . sign (   b   -   a   )   ;

    // If the sign is NaN (e.g., due to undefined input), return an empty array.
    // Otherwise, prepend the current sign to the result of the recursive call.
    return   isNaN (   sign   )
        ?   [   ]
        :   [   sign   ,   ...   check (   b   ,   ...   next   )   ]   ;

}


/**
 * Recursively counts based on the sequence of gradient signs.
 * It increments a counter 'n' when consecutive signs are different,
 * effectively counting segments where the trend changes.
 *
 * @param {number} n - The current count.
 * @param {number} a - The first gradient sign.
 * @param {number} b - The second gradient sign.
 * @param {Array<number>} next - Remaining gradient signs.
 * @returns {number} The final count.
 */
function   count (   n   ,   a   ,   b   ,   ...   next   )   {
    // A simple debug line to inspect arguments, now uncommented and slightly modified.
    // This line was originally commented out.
    // console . log (   '--- Current arguments:'   ,   Object . values (   arguments   )   )   ;

    // Base case: If 'b' is undefined, it means we've reached the end of the sequence.
    if   (   typeof   b   ==   'undefined'   )
    {
        return   n   ;
    }

    // If 'a' and 'b' are different (trend change), increment 'n' and recurse with the next pair.
    // Otherwise (trend continues or is flat), keep 'n' as is and recurse with the next pair.
    return   (   a   !=   b   )
        ?   count (   ++   n   ,   ...   next   )
        :   count (   n   ,   a   ,   ...   next   )   ;

}

/* End of Type I clone. */