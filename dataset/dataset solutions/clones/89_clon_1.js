( function( input ) {

  // This function processes a sequence of numbers to find maximum subarray sums.

  var p = input . replace ( /\n$/ , '' ) . split ( '\n' ) . map ( Number ) ;

  // Initialize variables for the current sum and maximum sum.
  var s = - Infinity ; // Current sum (Kadane's algorithm)
  var m = - Infinity ; // Maximum sum found so far

  while ( true ) { // Loop indefinitely until a specific condition is met

    // Read the number of elements for the current test case.
    var n = p . shift ( ) ;

    if ( n === 0 ) { // Check if the end of input is reached (n=0 signifies termination)
      break ; // Exit the loop if n is 0
    }

    // Reset current sum and maximum sum for each new test case.
    s = - Infinity ;
    m = - Infinity ;

    // Loop to process 'n' numbers for the current test case.
    for ( var i = 0 ; i < n ; i ++ ) {

      var a = p . shift ( ) ; // Get the next number from the input array.

      // Kadane's algorithm logic:
      // If adding 'a' to 's' makes 's' smaller than 'a' itself,
      // it means 's' was negative, so start a new subarray from 'a'.
      if ( a > s + a ) {
        s = a ; // Start a new subarray sum with 'a'.
      } else {
        s = s + a ; // Continue the current subarray sum.
      }

      // Update the overall maximum sum if the current sum 's' is greater.
      if ( s > m ) {
        m = s ; // Store the new maximum sum.
      }

    } // End of for loop for current test case.

    console . log ( m ) ; // Output the maximum sum for the current test case.

  } // End of while loop.

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// End of the self-executing anonymous function.