/*
 * This is an extensively modified Type-I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence,
 * with changes limited solely to whitespace and comments.
 *
 * All identifiers, operators, and expressions remain precisely as they were.
 *
 * Original script purpose:
 * Reads a number N from the first line, then N subsequent lines.
 * Each of these N lines contains two space-separated values.
 * The script checks if three consecutive lines have identical values (tmp[0] == tmp[1]).
 * If so, it prints "Yes" and exits. Otherwise, it prints "No".
 * It also contains unused utility functions for sorting.
 */

"use strict" ; /* Directs the browser/interpreter to use strict mode,
                 * which helps prevent common coding errors and "unsafe" actions. */


/**
 * The primary function responsible for processing the input data.
 * It simulates a problem-solving scenario where input is read line by line.
 *
 * @param {string} input - The entire raw input string, typically read from standard input.
 *                         This string is expected to contain multiple lines.
 */
function    main ( input )
{
    // First, process the raw input string.
    // .trim() removes leading/trailing whitespace (like newlines at the end).
    // .split("\n") divides the string into an array of individual lines.
    input   =   input . trim ( ) . split ( "\n" ) ;


    // Extract the first line, which is expected to be a number.
    // Convert this string number into an actual numeric type.
    const   line1   =   Number ( input [ 0 ] ) ;

    // Initialize a counter. This counter will track consecutive occurrences
    // of a specific condition being met.
    let     count   =   0 ;


    /*
     * Begin a loop that iterates through the input lines,
     * starting from the second line (index 1) up to the line number
     * specified by 'line1'.
     */
    for (  let   i   =   1 ;   i   <=   line1 ;   i ++  )
    {
        // For each relevant line, split it by spaces.
        // This assumes each line contains at least two space-separated values.
        const   tmp   =   input [ i ] . split ( " " ) ;

        // Check if the first element (index 0) is strictly equal to
        // the second element (index 1) of the current line's split values.
        if (  tmp [ 0 ]   ==   tmp [ 1 ]  )
        {
            // If the condition is met, increment the consecutive counter.
            count ++ ;
        }
        else
        {
            // If the condition is NOT met, reset the consecutive counter to zero.
            // This ensures we only count *consecutive* occurrences.
            count   =   0 ;
        }

        // After updating the counter, check if it has reached or exceeded a threshold.
        // In this case, the threshold is 3.
        if (  count   >=   3  )
        {
            // If the threshold is met, print "Yes" to the console.
            console . log ( "Yes" ) ;
            // Immediately terminate the execution of the 'main' function.
            // No further lines are processed once "Yes" is printed.
            return ;
        }

    } // End of the 'for' loop.


    // If the loop completes without 'count' ever reaching 3 or more,
    // it means the condition was never met three consecutive times.
    // In this scenario, print "No" to the console.
    console . log ( "No" ) ;

} // End of the 'main' function definition.



/**
 * A utility function designed to sort an array of numbers.
 * It uses a custom comparison function 'f' for its sorting logic.
 *
 * @param {Array<number>} array - The array of numeric values to be sorted.
 * @returns {Array<number>} The same array instance, now sorted in ascending order.
 */
function    numberSort ( array )
{
    array . sort ( f ) ; // The built-in sort method is called with our custom comparator 'f'.
    return  array ;      // Return the reference to the now-sorted array.
}


/*
 * This is a function expression that defines a comparison function.
 * It's specifically designed for numerical sorting in ascending order.
 *
 * When used with Array.prototype.sort(), it guides the sorting algorithm.
 * If 'a - b' is negative, 'a' comes before 'b'.
 * If 'a - b' is positive, 'b' comes before 'a'.
 * If 'a - b' is zero, their relative order remains unchanged (stable sort behavior).
 */
var     f   =   function    ( a ,   b )
{
    return  a   -   b ; // Returns the difference, which is standard for ascending numeric sort.
} ;


/*
 * This is the entry point for the script execution.
 * It reads the input from a file (typically /dev/stdin in competitive programming environments).
 * The 'fs' module (File System) is used for file operations.
 * 'readFileSync' reads the entire file synchronously.
 * The content is decoded as 'utf-8'.
 * Finally, this raw input string is passed to the 'main' function for processing.
 */
main (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf-8" )  ) ;

// --- End of JavaScript Code ---
// This marks the conclusion of the script.