/*
 * This script is designed to process numerical data from standard input.
 * It reads the input, parses it into structured arrays of numbers,
 * and then performs two distinct aggregations, finally printing the results.
 */

//  A variable, 'input', is declared to store the raw content
//  read from the standard input stream.
//  The 'fs' module is used for file system operations, specifically 'readFileSync'
//  to synchronously read the content of '/dev/stdin' as a UTF-8 encoded string.
var input   =   require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,   'utf8'  )   ;


//  The raw 'input' string is first trimmed to remove any leading or trailing whitespace.
//  Then, it is split into an array of strings, with each element representing a line
//  from the original input, using the newline character ('\n') as a delimiter.
var lines   =   input   .   trim (  )   .   split   (   '\n'    )   ;


/*
 *  The 'nums' variable will hold an array of arrays of numbers.
 *  Each original line string is processed:
 *  1. It's split by the comma (',') character into an array of string parts.
 *  2. Each string part is then explicitly converted into a number using the unary plus operator.
 *  This transformation ensures all data is in a numerical format for calculations.
 */
var nums    =   lines   .   map (
    function    (   line    )   {
        //  Inner operation: split the current 'line' string by commas.
        return  line    .   split   (   ',' )
            //  Further inner operation: map each resulting string part to a number.
            .   map (   function    (   n   )   {
                                                    return  +n  ;   //  Unary plus converts string to number.
                                                }   )   ;
    }   )   ;


//  The 'sum' variable is initialized to store the result of a reduction operation.
//  This reduction calculates the sum of products of the first two elements
//  of each inner array within 'nums'.
var sum     =   nums    .   reduce  (
    function    (   accumulator     ,   currentArray    )   {
        //  For each 'currentArray' (e.g., [num1, num2]),
        //  it adds the product of its first element (index 0) and second element (index 1)
        //  to the 'accumulator'.
        return  accumulator     +   currentArray[0]     *   currentArray[1]     ;
    }   ,
    0   //  The initial value for the 'accumulator' is set to 0.
)   ;


//  The 'qsum' variable is initialized to store another reduction result.
//  This reduction calculates the sum of the second element of each inner array within 'nums'.
var qsum    =   nums    .   reduce  (
    function    (   accumulator     ,   currentArray    )   {
        //  For each 'currentArray' (e.g., [num1, num2]),
        //  it adds its second element (index 1) to the 'accumulator'.
        return  accumulator     +   currentArray[1]     ;
    }   ,
    0   //  The initial value for the 'accumulator' is set to 0.
)   ;


//  The final calculated 'sum' is printed to the console.
console .   log (   sum )   ;


/*
 *  Finally, an average value is calculated and printed.
 *  'qsum' is divided by the total number of inner arrays in 'nums' (nums.length).
 *  The result of this division is then rounded to the nearest whole number
 *  using 'Math.round()' before being output to the console.
 */
console .   log (   Math    .   round   (   qsum    /   nums    .   length  )   )   ;