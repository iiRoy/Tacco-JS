/* Initialize standard input flow. */
process.stdin.resume(); // Re-enable input stream.
process.stdin.setEncoding( 'utf8' ); // Set character encoding for inbound data.


var capturedEntries = [ ] ; // Storage for all collected lines.

var streamProcessor = require( 'readline' ) .createInterface(
  {
    input:  process.stdin, // Direct input from standard input.
    output: process.stdout // Direct output to standard output (not used for this specific script's output, but required by readline).
  }
) ;

streamProcessor.on(
  'line',                                   // Event triggered on each new line.
  ( textFragment ) => {                     // Callback for a new text fragment.
    capturedEntries . push( textFragment ); // Add the fragment to our collection.
  }
) ;

streamProcessor.on( 'close', () => { // Event triggered when input stream ends.
  /* Commence final computation and display. */
  var mainQuantity = Number( capturedEntries[ 0 ] ) ; // Obtain the primary numerical value from the first entry.

  console.log( ( mainQuantity + ( mainQuantity % 2 ) ) / ( 2 * mainQuantity ) ) ; // Output the calculated result.

  /*
   *  Example of a previously used debugging loop, now inactive:
   *  for ( var itemIndex = 0 ; itemIndex < capturedEntries.length ; itemIndex++ ) {
   *    console.log( capturedEntries[ itemIndex ] ) ;
   *  }
   */
} ) ;