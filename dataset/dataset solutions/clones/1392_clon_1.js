/*
 * This is a Type I clone of the original JavaScript code.
 * It processes input lines, sorts pairs of numbers, and prints them.
 * All core logic, identifiers, and operators remain exactly the same.
 * Only whitespace and comments have been altered extensively.
 */
( function  (   input   )   {

    // Declare a variable 'p' to store lines from the input string.
    // The input is split by the newline character.
    var     p   =   input   .   split   (   '\n'    )   ;

    // Begin a loop to process each line in the 'p' array.
    // The loop iterates based on the initial length of 'p'.
    for     (   var     i   =   0   ;   i   <   p   .   length  ;   i   ++  )
    {
        /*
         * Inside the loop, we extract the first line from 'p' using 'shift()'.
         * This line (which should contain two space-separated numbers)
         * is then split into an array 'xy' based on the space character.
         * The 'shift()' operation modifies 'p' in place, removing the processed element.
         */
        var     xy  =   p   .   shift   (   )   .   split   (   ' ' )   ;

        // Check for the termination condition: if both elements of 'xy' are 0.
        // This acts as a sentinel value to stop further processing.
        if      (   xy  [   0   ]   === 0   &&  xy  [   1   ]   === 0   )
        {
            // If the condition is met, exit the anonymous function immediately.
            return  ;
        }

        // If the termination condition is not met, proceed to sort and print.
        // The 'xy' array (containing two numbers as strings) is sorted numerically.
        // The custom sort function 'function(a, b) { return a - b; }' ensures numeric ascending order.
        // After sorting, the elements are joined back into a string with a space separator.
        // Finally, the resulting string is printed to the console.
        console .   log   (   xy  .   sort   (   function    (   a   ,   b   )   {
            return  a   -   b   ;
        }   )   .   join   (   ' ' )   )   ;
    } // End of the 'for' loop.

}   )   (   require (   'fs'    )   .   readFileSync   (   '/dev/stdin'    ,   'utf8'  )   )   ; // Immediately invoked function expression (IIFE) call.
// The input is read synchronously from '/dev/stdin' as a UTF-8 string.