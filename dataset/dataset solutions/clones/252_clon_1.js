/*
 * This JavaScript file processes numerical data from standard input.
 * It reads lines, extracts numbers from each line, sums them up,
 * and then prints the total sum to the console.
 *
 * This is a Type I clone of an existing script, focusing on
 * whitespace and comment variations while preserving
 * the exact logic and identifiers.
 */

// Import the 'fs' module to handle file system operations, specifically reading from stdin.
var input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim ( ) ;

// Split the entire input string into an array of individual lines.
// Each element in 'lines' will be one line from the input.
var lines  =  input . split ( '\n' ) ;


// Initialize a variable to store the cumulative sum of all numbers found.
var sum  =  0 ;

// Declare a variable to hold the current line being processed.
var line ;

// Loop through each line in the 'lines' array.
// 'lines.shift()' removes the first element from the array and returns it,
// effectively processing lines one by one until the array is empty.
while  ( line  =  lines . shift ( ) )
{
  // Split the current line by any non-digit characters.
  // This extracts all sequences of digits, effectively getting the numbers.
  // The result 'arr' will be an array of strings, where each string is a number.
  var arr  =  line . split ( / \D + / ) ;

  // Use the reduce method to sum the numbers in the 'arr' array.
  // 'p' is the accumulator (previous value), 'n' is the current number string.
  // '+n' converts the string number to a actual number before adding.
  // The initial value for the sum (0) is provided as the second argument to reduce.
  sum  +=  arr . reduce ( function ( p , n ) {
                                                    /* Accumulate the sum */
                                                    return  p  +  ( + n ) ;
                                                  } ,  0
                                                ) ;
}

// After processing all lines and summing all numbers, print the final total.
console . log ( sum ) ;