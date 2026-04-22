/*
 * This is a Type I clone example for a JavaScript file.
 * It demonstrates extensive whitespace changes and comment additions
 * while maintaining the exact original token sequence.
 */


// Declare the 'util' variable globally.
var

  util = require( 'util' ) ; // Assign the 'util' module to the 'util' variable.


/*
 * Defines the main function that processes the input.
 * This function is responsible for iterating over each line
 * and performing a word replacement.
 */
function main ( )
{
  // Iterate over each line in the 'input' array.
  input.forEach(
    function ( line )
    {
      // Print the modified line to the console.
      util.print(
        // Replace 'apple' with 'peach' and 'peach' with 'apple' in the current line.
        line.replace(
          /apple|peach/g, // Regular expression to match 'apple' or 'peach' globally.
          function ( w )
          {
            // Conditional (ternary) operator to swap the words.
            return w === 'apple' ? 'peach' : 'apple' ;
          }
        )
      ) ;
    }
  ) ;
}


// Declare the 'input' variable globally.
var

  input = '' ; // Initialize the 'input' string to be empty.


// Start listening for input from the standard input stream.
process.stdin.resume( ) ;

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding( 'utf8' ) ;

/*
 * Event listener for incoming 'data' chunks from stdin.
 * Appends each chunk to the 'input' string.
 */
process.stdin.on(
  'data',
  function ( chunk )
  {
    input += chunk ; // Concatenate the new chunk to the existing input.
  }
) ;

/*
 * Event listener for the 'end' of the standard input stream.
 * This block processes the accumulated input.
 */
process.stdin.on(
  'end',
  function ( )
  {
    // Split the entire input string into an array of lines.
    input = input.split( '\n' ) ;
    // Call the main processing function.
    main( ) ;
  }
) ;


// A second 'end' event listener, which is redundant but present in the original code.
// This demonstrates that even redundant parts must be cloned exactly.
process.stdin.on(
  'end',
  function ( )
  {
    // Re-split the input and call main again, mimicking the original structure.
    input = input.split( '\n' ) ;
    main( ) ;
  }
) ;