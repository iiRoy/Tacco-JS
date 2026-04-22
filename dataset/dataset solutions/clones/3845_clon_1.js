/*
 * This JavaScript file demonstrates a simple
 * input processing logic.
 * It reads a single line from standard input,
 * splits it into two numbers, and performs a
 * conditional calculation.
 */

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding( 'utf-8' ) ;


// Register an event listener for incoming data on standard input.
// The 'data' event is fired when input is available.
process.stdin.on(
  'data',
  function   (   line   )
  {
    // Split the received line by spaces to get arguments.
    var args   =   line.split(   ' '   ) ;

    // Extract the first argument.
    var a   =   args[0] ;

    // Extract the second argument.
    var b   =   args[1] ;


    /*
     * Calculate 'count' based on a comparison between 'a' and 'b'.
     * If 'a' is less than or equal to 'b', 'count' becomes 'a'.
     * Otherwise, 'count' becomes 'a - 1'.
     */
    var   count   =   (   a   <=   b   )   ?   a   :   a   -   1   ;

    // Output the calculated count to the console.
    console.log(   count   ) ;
  }
) ; // End of 'data' event handler.