"use strict"; /* This directive enforces strict mode for the entire script. */

// The commented-out 'p' utility function for debugging purposes.
let inp = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ; /* Read input from standard input and remove leading/trailing whitespace. */

let max = Number ( inp . split ( '\n' ) [ 0 ] ) ; // Extract the first line as the maximum value.

let nums = inp . split ( '\n' ) [ 1 ] . split ( ' ' ) . map ( Number ) ; // Parse the second line into an array of numbers.

let formed_nums = ( new Array ( max ) ) . fill ( 0 ) ; /* Initialize an array of size 'max' with zeros. This array will count occurrences. */

// Debugging: Display the initial state of formed_nums (currently all zeros).
for ( let i = 0 ; i < max ; i ++ ) { // Loop through the input numbers to count their occurrences.
  formed_nums [ nums [ i ] - 1 ] ++ ; // Increment the count for the current number (adjusting for 0-based indexing).
}

// Debugging: Display the counts of each number after the first pass.

let sum = 0 ; // Variable to store the total sum of combinations.

formed_nums . forEach ( elm => { /* Iterate over the counts of each number to calculate initial combinations. */
  if ( elm >= 2 ) { // If a number appears at least twice, it can form pairs.
    sum += elm * ( elm - 1 ) / 2 ; // Add the number of combinations (nC2) for this count.
  }
} ) ;

// Debugging: Display the original array of numbers.
nums . forEach ( elm => { /* For each original number, calculate the result after removing one instance. */
  console . log ( sum - formed_nums [ elm - 1 ] + 1 ) ; // Output the adjusted sum for each number.
} ) ;