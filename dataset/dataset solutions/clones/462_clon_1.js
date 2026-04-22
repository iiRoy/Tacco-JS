/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered extensively
 * to create visual difference without changing functionality.
 */

// Define the main application logic within a function.
function  main  (  )
{

  // Declare some local variables.
  var
      line ,
      a    ,
      b    ;

  // This is an infinite loop, which will be broken explicitly.
  for ( ; ; )
  {
    // Read and parse the next number from the input stream.
    // The 'input' variable is expected to be an array of strings.
    n  =  parseInt (  input.shift  (  )  ,  10  ) ;

    // Check if the end-of-input signal (0) has been received.
    if  (  n   ===   0  )
    {
      // If so, terminate the processing loop.
      break ;
    }

    // Process the number and print the result to the console.
    // Convert the number to base 8, then split it into individual digits.
    // Map each digit to a character from a custom sequence '01235789'.
    // Finally, join the characters back into a string.
    console . log (
        n . toString ( 8 )
          . split ( '' )
          . map ( function ( c )
          {
            // The unary plus operator converts 'c' to a number before charAt.
            return  '01235789' . charAt  (  + c  ) ;
          } )
          . join ( '' )
    ) ; // End of console.log statement.
  }
} // End of main function definition.


// Global variable declaration for storing input data.
var

    input = '' ; // Initialize input as an empty string.


// Set up standard input processing.
// This ensures the application doesn't exit immediately.
process.stdin.resume ( ) ;

// Configure the encoding for incoming data from standard input.
process.stdin.setEncoding ( 'utf8' ) ;

// Attach an event listener for 'data' events on standard input.
// This callback accumulates chunks of data into the 'input' variable.
process.stdin.on ( 'data' , function ( chunk )
{
  // Append the received data chunk to the global input string.
  input  +=  chunk ;
} ) ;

// Attach an event listener for the 'end' event on standard input.
// This callback is triggered when all input has been received.
process.stdin.on ( 'end' , function ( )
{
  // Once all data is received, split the accumulated string by newlines
  // to get an array of input lines.
  input  =  input . split ( '\n' ) ;

  // After preparing the input, invoke the main processing function.
  main ( ) ;
} ) ;