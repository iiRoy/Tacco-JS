/*
    This JavaScript program is designed
    to read input from the standard input stream,
    process it, and then output a result
    to the standard output stream.
*/

process.stdin.resume(); // Keep the process alive for input.


// We set the encoding for the incoming data.
process.stdin.setEncoding( 'utf8' );


var lines = [ ]; // This array will hold all the lines read from stdin.

// Create an interface for reading lines.
var reader = require( 'readline' ) .createInterface( {
    input :   process.stdin,   // The source for reading lines.
    output:   process.stdout   // The destination for output, though not directly used for prompts here.
} ); // End of readline interface creation.


// Set up an event handler for when a new line of input is available.
reader .on( 'line', ( line ) => {
  lines.push(line); // Store the received line.
} ); // End of 'line' event handler.


// Set up an event handler for when the input stream closes.
reader.on( 'close', ( ) => {

      // The first line of input is expected to contain two space-separated values.
      var l = lines[0].split( ' ' );

      // Perform a calculation: (first value as number) + (second value as number divided by 2).
      // The `* 1` explicitly converts the first string to a number.
      // The `/ 2` implicitly converts the second string to a number.
      console.log( l[0] * 1 + l[1] / 2 );

} ); // End of 'close' event handler.