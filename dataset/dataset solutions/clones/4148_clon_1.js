/*
 * This is a Type I clone example.
 * It processes input from stdin to calculate a specific value.
 * The original logic is preserved byte-for-byte,
 * with only whitespace and comments altered.
 */

'use strict' ; // Enforce strict mode for cleaner code in this script.


const input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
  . trim ( ) // Remove any leading or trailing whitespace from the input string.
  . split ( ' ' ) // Split the cleaned string by spaces into an array of string numbers.
  . map ( x => x * 1 ) ; // Convert each string element in the array to a numeric type.

// Initialize the counter for the answer.
let ans = 0 ;

// Extract the maximum value and the divisor from the processed input array.
let max = input [ 1 ] ; // The second element is the maximum limit.
let div = input [ 0 ] ; // The first element is the initial divisor.

// A temporary number, starting with the divisor, which will be doubled.
let tmpNum = div ;

// Loop as long as the temporary number does not exceed the maximum limit.
while ( tmpNum <= max ) {
  // Double the temporary number in each iteration.
  tmpNum *= 2 ;

  // Increment the answer counter for each successful doubling.
  ans ++ ;
}


// Print the final calculated answer to the console.
console . log ( ans ) ;