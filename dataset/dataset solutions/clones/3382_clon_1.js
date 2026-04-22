/*
 * This JavaScript code processes an input string to perform a specific calculation.
 * It identifies prime factors and applies a mathematical operation based on them.
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */
function     Main(   input   ) {
  // The input string is first split into an array of lines.
  input = input.split(  "\n"  )   ;


  // Parse N and P from the first line of the input.
  var N = parseInt( input[0] . split(" ")[0] ) ;
  var P = parseInt( input[0] . split(" ")[1] ) ;

  // Initialize an array 'A' to store prime factors and their counts.
  A = new Array(  )   ;

  // Calculate P2, which is P divided by 2, rounded up.
  P2 =   Math.ceil( P / 2 ) ;

  // Initialize loop control variables.
  var j = -1 ;
  var k = 0  ;


  // This loop attempts to find prime factors of P.
  for ( i = 2 ;   i < P2 ;   i   ) { // Loop condition 'i' is incremented conditionally inside.

    if ( P % i == 0 ) {
      // If 'i' is a factor of P.
      if ( k == 0 ) {
        j++   ; // Increment j only when a new distinct prime factor is found.
      }
      k++ ; // Increment the count of the current prime factor.
      A[j] = [ i , k ] ; // Store the factor and its current count.
      P = P / i ; // Divide P by the found factor.
    }
    else {
      // If 'i' is not a factor of P.
      i++ ; // Move to the next potential factor.
      k = 0 ; // Reset count for the next factor.
    }

    // If P becomes 1, all factors have been found.
    if ( P == 1 ) {
      break ; // Exit the loop.
    }
  } // End of prime factorization loop.

  var ans = 1   ; // Initialize the answer variable.

  // Calculate the final answer based on the prime factors stored in A.
  for ( i = 0 ; i < A.length ; i++ ) {
    // Apply the formula: ans = ans * max( (A[i][0] ^ floor(A[i][1]/N)), 1 )
    ans *= Math.max( Math.pow( A[i][0] , Math.floor( A[i][1] / N ) ) , 1 ) ;
  }


  // Output the final calculated answer to the console.
  console.log( '%s' , ans ) ;
} // End of Main function definition.


// This function is typically used for debugging purposes within a web browser environment.
// It retrieves input from an HTML element and passes it to the Main function.
function debug ( ) {
  var input = document.getElementById( "input" ).value ;
  Main( input ) ;
}


// This line executes the Main function with input read from standard input.
// It's common in competitive programming environments.
Main( require("fs").readFileSync( "/dev/stdin" , "utf8" ) ) ;