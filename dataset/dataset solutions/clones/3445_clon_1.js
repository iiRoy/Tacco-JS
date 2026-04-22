/*
 * This JavaScript program reads two space-separated numbers
 * from standard input, performs a specific calculation,
 * and prints the result to standard output.
 *
 * It demonstrates basic file I/O, string manipulation,
 * type conversion, and arithmetic operations in Node.js.
 */
const   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;   // Reads the entire content of /dev/stdin as a UTF-8 string.


// The raw input string is then processed.
// It is expected to contain two numbers separated by a single space.
const   list    =   input   .   split   (   ' '   )   ;   /* The 'split' method divides a String object into an ordered list of substrings,
                                                         puts these substrings into an array, and returns the array.
                                                         Here, it splits by a space character. */


        // Perform the calculation and output the result.
        // The calculation is: first_number + (second_number / 2).
console   .   log   (
    Number   (   list   [   0   ]   )       // Convert the first string element to a number.
    +                                   // Addition operator.
    Number   (   list   [   1   ]   )   /   2   // Convert the second string element to a number, then divide it by 2.
)   ;   // End of the program's primary logic.