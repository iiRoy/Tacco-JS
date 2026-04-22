process.stdin.resume(); /* Initialize input stream reading */


process.stdin.setEncoding( 'ascii' ); // Set the character encoding for incoming data


var input_stdin = ""; // Buffer to accumulate raw input data
var input_stdin_array = ""; // Array to hold processed input lines
var input_currentline = 0; // Index for tracking the current line being read


process.stdin.on(
  'data',
  function ( data ) { // Event handler for receiving data chunks
    input_stdin += data; // Append new data to the input buffer
  }
); // End of data event listener


process.on(
  'SIGINT', // Handle interrupt signal (e.g., Ctrl+C)
  function ( ) {
    input_stdin_array = input_stdin.split( "\n" ); // Split accumulated input into lines
    main( ); // Execute the primary program logic
    process.exit( ); // Terminate the process gracefully
  }
); // End of SIGINT handler


process.stdin.on(
  'end', /* Fired when all input has been received */
  function ( ) {
    input_stdin_array = input_stdin.split( "\n" ); // Finalize input lines array
    main( ); // Call the main function to process the input
  }
);


function readLine ( ) {
  // Utility function to retrieve the next line from the input array
  return input_stdin_array[ input_currentline++ ];
}

/*
 *  ------------------------------------------------------------------
 *  The boilerplate code above this section handles standard input
 *  for Node.js. It is generally not part of the problem-specific
 *  solution logic itself.
 *  ------------------------------------------------------------------
 */

function main ( ) {
  // This is the core function where the problem's solution logic resides.

  var s = readLine( ); // Read the first line of input (e.g., dimensions)
  s = s.split( " " ); // Split the line by space to separate values

  var H = parseInt( s[ 0 ] ), // Parse the height (H) from the first value
      W = parseInt( s[ 1 ] ); // Parse the width (W) from the second value

  var C = [ ]; // Initialize an empty array to store the grid/matrix 'C'

  // Loop to read H subsequent lines, forming the grid 'C'
  for ( var i = 0; i < H; i++ ) {
    s = readLine( ); // Read each line of the grid
    C.push( s ); // Add the read line (row) to the 'C' array
  }

  // Loop to iterate through the grid 'C' and print each row twice
  for ( var i = 0; i < H; i++ ) {
    console.log( C[ i ] ); // Print the current row for the first time
    console.log( C[ i ] ); // Print the same current row again (duplication)
  }
} // End of the main function