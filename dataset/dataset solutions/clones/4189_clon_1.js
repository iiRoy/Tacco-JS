/* This script defines an immediately-invoked function expression (IIFE)
 * to prevent global scope pollution and ensures strict mode for better code quality.
 */
( function () {
  'use strict'; // Activates strict mode parsing and execution for safer JavaScript.

  // Declare an array to hold each line of input received.
  var lines = [ ];

  // Configure the 'readline' module to handle input from the standard input stream.
  require( 'readline' )
    .createInterface( {
      input :  process.stdin,   // Specifies standard input as the source.
      output:  process.stdout   // Specifies standard output (though not directly used by `on('line')`).
    } )
    .on( 'line', function ( line ) { // Attach a listener for each line of input.
      lines . push ( line );      // Store the received line into the 'lines' array.
    } );

  // Once the standard input stream signals its end, this handler will execute.
  process . stdin . on ( 'end', function () {

    // The following block is a commented-out section from the original.
    // It appears to be an example or debugging code that was not active.
    /*
    //lines.forEach(function(line) {
    //  var tokens = line.split(' ').map(Number);
    //    console.log(tokens[0] + ' ' + tokens[1]);
    //}
    //)
    */
    ; /* This semicolon was present in the original code,
       * immediately following the commented-out block.
       * It is preserved as per Type I cloning rules. */


    // --- Core logic begins here ---
    // This part of the code processes the collected input lines.

    // Take the first line of input and split it by spaces.
    // Note: If lines[0] is intended to be a single number string,
    // splitting it by space might yield an array like ["123"] if no spaces.
    var inLines = lines[ 0 ] . split ( " " );

    // Determine the "length" of the 'inLines' variable after converting it to a string.
    // This effectively gets the number of characters in its string representation.
    var keta = ( inLines + '' ) . length;

    // Initialize a variable to accumulate the sum of digits.
    var insum = 0;

    // Iterate through each character of the string representation of 'inLines'.
    for ( var i = 0 ; i < keta ; i ++ ) {
      // Convert each character to an integer and add it to 'insum'.
      insum += parseInt ( ( inLines + '' ) [ i ] );
    }

    // Calculate the remainder of 'inLines' (implicitly converted to a number)
    // when divided by the calculated sum of digits.
    var amari = inLines % insum;

    // Another commented-out line from the original, likely for debugging.
    // console.log(insum)

    // Conditional check based on the calculated remainder.
    if ( amari == 0 ) {
      // If the remainder is zero, output "Yes".
      console . log ( "Yes" );
    } else {
      // Otherwise (if remainder is not zero), output "No".
      console . log ( "No" );
    }

    // Final commented-out line, possibly for another calculation or test.
    // console.log( Math.pow(parseInt(lines[0]),2) - parseInt(lines[1]) )

    // --- Core logic ends here ---

  } ); // Terminates the 'end' event handler definition.


} ) (); // Executes the IIFE.