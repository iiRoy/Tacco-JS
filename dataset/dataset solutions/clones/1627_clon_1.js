/* This is a JavaScript program designed to solve a specific problem.
 * It processes an input value and attempts to find a particular result
 * based on iterative calculations.
 */
function Main ( input ) { // The main function entry point.
  // Declare and initialize variables needed for the computation.
  var K = input; // K stores the original input value for later use.
  var n = 0;     /* n accumulates a specific sequence of numbers. */
  var result = null; // result will store the final answer if found, otherwise it remains null.


  // This is the primary loop structure. It iterates from 0 up to the input value.
  for ( var i = 0 ; i <= input ; i ++ ) {
    // Calculate the next value of 'n' based on a power of 10 and the digit 7.
    n = n + ( 7 * Math.pow ( 10 , i ) ) ;

    // Check if the current 'n' is still within the bounds of the input.
    if ( n <= input ) {
      continue; // If 'n' is too small, skip to the next iteration.
    }

    // If 'result' has already been found in a previous inner loop,
    // there's no need to continue further calculations.
    if ( result ) {
      break; // Exit the outer loop if a result is already determined.
    }

    // Inner loop: Check multiples of K against the current value of 'n'.
    // This loop continues as long as j*K does not exceed n.
    for ( var j = 1 ; j * K <= n ; j ++ ) {
      var m = K * j ; // Calculate the current multiple of K.
      // Compare the multiple 'm' with 'n'.
      if ( m == n ) {
        // If they are equal, we've found a match!
        result = i + 1 ; // Store the iteration count (plus one) as the result.
        break ; // Exit the inner loop as the result is found.
      }
    }
  }


  // After the loops complete, check if a result was found.
  if ( result ) {
    console.log ( result ) ; // If yes, print the result.
  }
  else {
    // Otherwise, if no result was found, print '-1' as per problem specification.
    console.log ( '-1' ) ;
  }
}
// This line reads input from standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;