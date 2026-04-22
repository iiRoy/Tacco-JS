/* This function processes input data to calculate a specific result.
 * It takes a string 'input', parses it, and performs arithmetic operations.
 *
 * @param {string} input - The raw input string containing space-separated numbers.
 */
function Main(  input )
{
  // First, clean up the input string by removing leading/trailing whitespace.
  input = input.trim( ) ;


  // Then, split the input string into an array of substrings based on spaces.
  input = input.split( " " ) ;

  // Extract numerical values from the parsed input array.
  var a = input[0] ; // The first number.
  var b = input[1] ; // The second number.
  var c = input[2] ; // The third number.

  // Initialize the result variable.
  var result = 0 ;

  // Calculate intermediate values 'd' and 'e'.
  var d = a - b ; // Difference between 'a' and 'b'.
  var e = c - 1 ; // 'c' decremented by one.

  // Conditional logic based on the parity of (c - b).
  if ( ( c - b ) % 2 == 0 )
  {
      // If (c - b) is even.
      if ( ( c - b - 2 ) >= 0 )
      {
          // Further adjustments to 'd' and 'e' if condition met.
          d -= ( c - b - 2 ) / 2 ;
          e -= ( c - b - 2 ) / 2 ;
      } // End of inner if block
  }
  else
  {
      // If (c - b) is odd.
      if ( ( c - b - 1 ) >= 0 )
      {
          // Further adjustments to 'd' and 'e' if condition met.
          d -= ( c - b - 1 ) / 2 ;
          e -= ( c - b - 1 ) / 2 ;
      } // End of inner if block
  } // End of outer if-else block


  // Determine the minimum of the adjusted 'd' and 'e' values.
  result = Math.min( d , e ) ;

  // Another conditional adjustment to the result.
  if ( ( c - b ) % 2 == 0 )
  {
    // If (c - b) is even, update result with the minimum of current result and (c-b)/2.
    result = Math.min( ( c - b ) / 2 , result ) ;
  } // End of final if block

  // Output the final calculated result to the console.
  console.log( result ) ;
} // End of Main function definition

// Call the Main function with input read from standard input.
// This line uses Node.js specific modules to read input.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;