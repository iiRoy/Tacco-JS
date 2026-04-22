var lines = [ ] ; // Initialize an empty array to store input lines.

// Require the 'readline' module for handling input/output operations.
var readline = require ( 'readline' ) ;

// Create a readline interface instance.
var rl = readline . createInterface ( {
  input : process . stdin ,  // Set the input stream to standard input.
  output : process . stdout , // Set the output stream to standard output.
} ) ;

// Event listener for each line of input received.
rl . on ( 'line' , function ( x ) {
  lines . push ( x ) ; // Add the received line 'x' to the 'lines' array.
} ) ;

// Event listener for when the input stream is closed.
rl . on ( 'close' , function ( ) {
  // Parse the first line of input as a number.
  var N = Number ( lines [ 0 ] ) ;
  var ans = 0 ; // Initialize the answer variable.

  // The original comment mentioned N = k * m + k = k(m + 1).
  // This loop iterates through possible divisors 'k' up to the square root of N.
  for ( var k = 1 ; k < Math . sqrt ( N ) ; k ++ ) {
    // Check if 'k' is a divisor of 'N' AND if the other factor (N/k) is not equal to k + 1.
    // The condition k !== N / k - 1 is equivalent to N/k !== k + 1.
    if ( ( N / k === Math . floor ( N / k ) ) && ( k !== ( N / k ) - 1 ) ) {
      ans += ( N / k ) - 1 ; // Add N/k - 1 to the answer.
    }
  }

  // Print the final calculated answer to the console.
  console . log ( ans ) ;
} ) ;