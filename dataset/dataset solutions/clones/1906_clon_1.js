/*
 * This function, E166, takes a string input and processes it
 * to perform a specific calculation involving numerical sequences.
 * It's designed to solve a problem where pairs of elements
 * from a 'height' array are compared based on their indices and values.
 */
function E166 ( _input ) {
  // Declare a variable 'lines' to store the input split by newline characters.
  var lines = _input . split ( "\n" ) ;

  // 'num' will store the first number from the input, converted to an integer.
  // The 'shift()' method removes the first element from the 'lines' array.
  var num = lines . shift ( ) * 1 ;

  // 'height' will store an array of numbers. The second line of input is
  // split by spaces, and each resulting string is converted to an integer.
  var height = lines . shift ( ) . split ( ' ' ) . map ( item => item * 1 ) ;

  // Initialize a counter variable 'count' to zero. This will accumulate
  // the number of times a specific condition is met during iteration.
  var count = 0 ;


  // Outer loop: Iterates from 'num' down to 1 (inclusive).
  // 'i' represents the first index for comparison.
  for ( let i = num ; i >= 1 ; i -- ) {
    // Inner loop: Iterates from 'num' down to 1 (inclusive).
    // 'j' represents the second index for comparison.
    for ( let j = num ; j >= 1 ; j -- ) {

      // Condition check: Ensure that the two indices 'i' and 'j' are distinct.
      // We are only interested in pairs of different elements.
      if ( i !== j ) {
        // Calculate the absolute difference between the two current indices.
        var diff = Math . abs ( i - j ) ;

        // Calculate the sum of the 'height' values at the corresponding
        // 0-indexed positions. Note: 'i' and 'j' are 1-based from the problem context.
        var sum = height [ i - 1 ] + height [ j - 1 ] ;

        // If the absolute difference of indices equals the sum of heights
        // at those positions, then increment the counter.
        if ( diff === sum ) {
          count ++ ; // Increment the 'count' variable.
        } // End of inner 'if' block for diff === sum
      } // End of outer 'if' block for i !== j
    } // End of inner 'for' loop for 'j'
  } // End of outer 'for' loop for 'i'

  // Finally, print the accumulated 'count' multiplied by 0.5 to the console.
  console . log ( count * 0.5 ) ;
} // End of the E166 function definition.


// This line reads input from standard input, typically used in competitive programming
// environments or when piping input. The read data is then passed to the E166 function.
E166 ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;