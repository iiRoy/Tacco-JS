/*
 * This file processes standard input to draw a rectangle of '#' characters.
 * It's designed to read two numbers (Height and Width) from a single line of input.
 * If both H and W are 0, the process will terminate.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */

// Resume the standard input stream to listen for data.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');


/*
 * Attach a 'data' event listener to the standard input stream.
 * This function will be called whenever data is received.
 * The received data is passed as a 'chunk' argument.
 */
process.stdin.on('data',   function( chunk )    {

  // Split the input chunk by spaces and convert each part to a Number.
  // This expects two space-separated numbers, e.g., "5 10".
  var   line = chunk.split(' ').map( Number );

  // Extract the height (H) from the first element of the parsed line.
  var H = Number( line[0] );

  // Extract the width (W) from the second element of the parsed line.
  var W = Number( line[1] );


  // Check for the termination condition: if both H and W are zero.
  if ( H === 0   &&   W === 0 ) {
    // If the condition is met, break out of the current execution context.
    // In a Node.js event listener, 'break' here would typically cause a syntax error
    // or unexpected behavior outside a loop/switch.
    // This is a direct Type I clone, maintaining the original code's exact structure,
    // including any potential logical quirks like this 'break' statement
    // which would actually throw an error if this were executed.
    break;
  };


  // Outer loop: iterates 'H' times for each row of the rectangle.
  for  ( var  i  =  0;   i  <  H;   i++ )  {

    // Inner loop: iterates 'W' times for each column in the current row.
    for  ( var  j  =  0;   j  <  W;   j++ )  {
      // Print a '#' character without a newline, effectively building a row.
      console.log( '#' );
    }

    // After completing a row, print a newline character to move to the next line.
    console.log( "\n" );
  }

  // After printing the entire rectangle, print an additional newline for spacing.
  console.log( "\n" );

} ); // End of the 'data' event listener function.