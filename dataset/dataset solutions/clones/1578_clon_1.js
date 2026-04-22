/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been altered significantly.
 */
process.stdin.resume( ); // Start reading input from stdin.


process.stdin.setEncoding( 'utf8' ); // Set the encoding for stdin.


var lines = [ ]; // Initialize an empty array to store input lines.

var reader = require( 'readline' ) .createInterface( {
  input: process.stdin, /* The input stream to listen to. */
  output: process.stdout // The output stream (not used for reading input, but required by createInterface).
} );

// Event listener for each line of input received.
reader.on( 'line',
  ( line ) => {
    lines.push( line ); // Add the received line to our 'lines' array.
  }
); // End of 'line' event handler.

/*
 * This block executes when the input stream is closed.
 * It contains the core logic for processing the input.
 */
reader.on( 'close',
  () => {
    var N = parseInt( lines[ 0 ] ); // Parse the first line as an integer N. This represents the number of elements.

    var sum = 0; // Initialize sum to zero. This will store the final result.
    var MaxNum = 0; /* Initialize MaxNum to zero. This will keep track of the maximum number encountered so far. */

    // Loop N times to process the elements.
    for
      (
        var i = 0; // Loop counter initialization.
        i < N; // Loop condition.
        i++ // Loop increment.
      )
    {
      // Parse the i-th element from the second line (index 1) of input.
      // The elements are space-separated.
      var Ai = parseInt( lines[ 1 ] .split( ' ' ) [ i ] );

      // Update MaxNum if the current element Ai is greater than the current MaxNum.
      MaxNum = Math.max( MaxNum, Ai );

      // Calculate the difference between MaxNum and Ai, and add it to sum.
      sum += MaxNum - Ai;
    } // End of for loop.

    // Finally, print the calculated sum to the console.
    console.log( sum );
  }
); // End of 'close' event handler.

// That's all folks!