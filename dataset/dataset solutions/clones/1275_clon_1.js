/*
 * This JavaScript script is designed to read
 * input from standard input, process it,
 * and then output a transformed result
 * to the console.
 *
 * It demonstrates basic file system interaction
 * and array manipulation techniques.
 */


//  Import the 'fs' module, which provides
//  functionality for interacting with the file system.
//  Specifically, we use 'readFileSync' to get the input.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;   //  Reads the entire content of /dev/stdin as a UTF-8 string.


//  The input string is then split into an array of strings,
//  where each element represents a line from the input.
//  The splitting occurs at each newline character.
var   Arr   =   input   .   split   (   "\n"   )   ;

//  From the array of lines, we select the second line
//  (at index 1, as arrays are zero-indexed).
//  This chosen line is then split into another array,
//  using a single space as the delimiter for separation.
var   arr   =   (   Arr   [   1   ]   )   .   split   (   " "   )   ;   //  'arr' now contains elements from the second input line.


//  The order of elements within the 'arr' array is
//  reversed in place. This operation modifies the array directly.
arr   .   reverse   (   )   ;   //  The array 'arr' now holds its elements in reverse order.


//  Finally, the elements of the reversed 'arr' array are joined back
//  into a single string. A single space character is used as the separator
//  between each element in the resulting string.
//  This final string is then printed to the console.
console   .   log   (   arr   .   join   (   " "   )   )   ;   //  Outputs the space-separated, reversed elements of the second input line.