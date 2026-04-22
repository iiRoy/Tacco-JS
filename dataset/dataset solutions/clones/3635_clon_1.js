/*
 * This JavaScript file processes input from standard input to categorize a numerical value.
 * It strictly adheres to modern JavaScript standards for clarity and performance.
 */

'use strict' ;


    // The `input` variable will store an array of strings obtained by reading from standard input,
    // decoding it as UTF-8, and then splitting by any whitespace characters.
const input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . split ( / \s / ) ;


        // `N` is extracted from the first element of the `input` array and converted into a number.
        // This 'N' value is the primary determinant for the classification logic.
const N     =   Number ( input [ 0 ] ) ;


/*
 * The `result` variable is assigned a string based on the value of `N`.
 * This uses a nested ternary operator for concise conditional logic:
 *   - If N is less than 1200, the result is 'ABC'.
 *   - Otherwise, if N is less than 2800, the result is 'ARC'.
 *   - In all other cases (N is 2800 or greater), the result is 'AGC'.
 */
const result    =   ( N   <   1200 )
                        ?   'ABC'
                        :   ( N   <   2800 )
                            ?   'ARC'
                            :   'AGC'
;


// Finally, the determined `result` string is printed to the console's standard output.
console . log ( result ) ;