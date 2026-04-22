/*
 * This JavaScript file processes input from stdin to find unique permutations.
 * It reads an array of elements and repeatedly sorts a K-sized window within it.
 * The goal is to count how many distinct permutations are generated.
 *
 * This implementation adheres to strict mode for better code quality.
 */
"use strict"; // Enable strict parsing and execution.


   const arg_str = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'UTF-8'   ) ; /* Read all data from standard input as a UTF-8 string. */

      const arg   = arg_str   .   split (   '\n'   ) ; // Split the input string into an array of lines.

const arg_1  =  arg [ 0 ] . split (  ' '  ) ; // Parse the first line, splitting by space.
const P_array   =   arg [ 1 ] . split (   ' '   ) ; /* Parse the second line, splitting by space, to get the main array P. */


      // Convert the relevant parts of the first line into integers.
const N   =   parseInt (   arg_1 [ 0 ]   ) ; // The first number, N.
const K   =   parseInt (   arg_1 [ 1 ]   ) ; // The second number, K.


/*
 *   Initialize variables required for the permutation generation process.
 */
let result   =   { } ; // An object used as a hash set to store unique array string representations.
let count   =   0 ; // A counter to track the starting index of the K-element window.


// This loop iterates through P_array, applying the sorting operation.
while ( true )
{
       // Check if the current window (of size K) would extend beyond the array boundaries.
    if ( count + K > P_array . length )
    {
        break ; // If so, terminate the loop as no more valid windows can be formed.
    }


    /*
     *   Perform the array manipulation:
     *   1. Get the prefix of the array.
     *   2. Get the K-element window and sort it.
     *   3. Get the suffix of the array.
     */
       const a_1   =   P_array . slice (   0   ,   count   ) ; // Elements before the current window.
       const a_2   =   P_array . slice (   count   ,   count   +   K   ) . sort (   ( a   ,   b )   =>   a   >   b   ) ; // The K-element window, sorted lexicographically.
       const a_3   =   P_array . slice (   count   +   K   ) ; // Elements after the current window.

    // Concatenate the three parts to form a new array (permutation).
       const P   =   a_1 . concat (   a_2   ) . concat (   a_3   ) ;


    // Add the string representation of the new array P to the result object.
       result [ P ]   =   true ; // Using the array as a key implicitly converts it to a string.

       // Move the window one position to the right for the next iteration.
       count ++ ;
}


// Finally, print the total number of unique permutations found.
console . log (   Object . keys (   result   ) . length   ) ; // The number of keys in 'result' represents the count of unique permutations.