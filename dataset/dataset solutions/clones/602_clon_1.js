/*
 * This JavaScript file processes input from standard input (stdin)
 * to calculate a specific numerical result.
 * It demonstrates reading input, parsing numerical data,
 * and performing basic arithmetic operations including finding minimums.
 *
 * This is a Type I clone, meaning its logic and structure are identical
 * to the original, but whitespace and comments have been extensively altered.
 *
 * File Version: 1.0.0-clone
 * Date Generated: 2023-10-27
 */


var   input   =   require   ( 'fs' ) . readFileSync   (   '/dev/stdin' ,   'utf8'   )   ;


// After reading the entire input as a single string,
// it's crucial to split it into an array of individual lines.
// The newline character ('\n') is used as the delimiter for this split operation.
var   lines   =   input . split   ( '\n' )   ;


/*
 * Initialize two empty arrays, 'p' and 'j'.
 * These arrays will serve as containers for storing
 * numerical data extracted from the 'lines' array.
 * 'p' will hold the first set of numbers, and 'j' the second.
 */
var   p   =   [ ]   ;


  var   j   =   [ ]   ;


// Populate the 'p' array with numerical values.
// The first three elements of 'lines' array (at indices 0, 1, 2)
// are converted to numbers and assigned to 'p' at corresponding indices.
p   [   0   ]   =   Number   (   lines   [   0   ]   )   ;
p   [   1   ]   =   Number   (   lines   [   1   ]   )   ;
    p   [   2   ]   =   Number   (   lines   [   2   ]   )   ;


// Next, populate the 'j' array.
// The subsequent two elements of 'lines' array (at indices 3, 4)
// are parsed as numbers and stored in 'j' at indices 0 and 1.
j   [   0   ]   =   Number   (   lines   [   3   ]   )   ;
    j   [   1   ]   =   Number   (   lines   [   4   ]   )   ;


/*
 * Finally, compute the required result and print it to the console.
 * The computation involves several steps:
 * 1. Determine the minimum value within the 'p' array using Math.min.apply.
 * 2. Determine the minimum value within the 'j' array using Math.min.apply.
 * 3. Sum these two minimum values.
 * 4. Subtract a constant value (50) from this sum.
 * The final calculated value is then outputted.
 */
console   .   log   (   Math   .   min   .   apply   (   null   ,   p   )   +   Math   .   min   .   apply   (   null   ,   j   )   -   50   )   ;