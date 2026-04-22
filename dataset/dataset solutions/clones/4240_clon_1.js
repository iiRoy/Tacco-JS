/*
 * This is a Type I clone of an original JavaScript program.
 * It demonstrates variations purely in whitespace and comments.
 * All functional aspects, variable names, and logic remain identical.
 */

// Declare a variable to store input lines.
var lines = [ ] ;


// Import the 'readline' module for handling input.
var readline = require ( 'readline' ) ;


// Create a readline interface configuration.
var rl = readline . createInterface ( {
  input  :  process . stdin  ,  // Standard input stream
  output :  process . stdout  ,  // Standard output stream
} ) ; // End of readline interface creation.


// Event listener for each line of input received.
rl . on ( 'line' , function ( x )
  {
    // Push the received line 'x' into the 'lines' array.
    lines . push ( x ) ;
  }
) ;


// Event listener for when the input stream closes.
rl . on ( 'close' ,
  function ( )
  {
    /*
     * Process the first line of input to extract N and M.
     * The first line is expected to contain two space-separated numbers.
     */
    var N = Number ( lines [ 0 ] . split ( " " ) [ 0 ] ) ; // Extract N (first number)
    var M = Number ( lines [ 0 ] . split ( " " ) [ 1 ] ) ; // Extract M (second number)

    // Calculate and print the final result to the console.
    // The formula is: (2^M) * (1900*M + 100*(N-M))
    console . log ( Math . pow ( 2 , M ) * ( 1900 * M + 100 * ( N - M ) ) ) ;
  } // End of close event handler function.
) ;