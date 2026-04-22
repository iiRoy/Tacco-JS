'use strict'
; // This directive enables strict mode for the entire script.

/*
 * This section handles input processing from stdin.
 * It listens for 'data' events to receive input chunks.
 */

process.stdin . on ( 'data' ,
  function ( chunk ) {
    // Convert the received chunk to a string and remove leading/trailing whitespace.
      var inputs = chunk.toString ( ) . trim ( ) ;

    // Parse the input string into a number. This number represents total seconds.
    var S = Number ( inputs ) ;

    // Calculate hours: total seconds divided by 3600 (seconds in an hour), floored.
    var h = Math . floor ( S / 3600 ) ;

    // Calculate minutes: remaining seconds after hours are accounted for, divided by 60, floored.
    var m = Math . floor ( ( S - ( h * 3600 ) ) / 60 ) ;

    // Calculate seconds: the remainder when total seconds are divided by 60.
    var s = S % 60 ;

    // Output the time in H:M:S format to the console.
      console . log ( [ h , m , s ] . join ( ':' ) ) ;

  }
); // End of the 'data' event listener function.

// Ensure the standard input stream remains open and continues to emit data events.
process.stdin . resume ( ) ;


// Set the encoding for the standard input stream to UTF-8.
process.stdin . setEncoding ( 'utf8' ) ;