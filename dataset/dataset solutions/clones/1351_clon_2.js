process
  .stdin
  .resume ( ) ; // Activate the standard input stream to listen for data.


// Register an event listener to handle incoming data chunks from the input source.
process
  .stdin
  .on (
    "data" , // This callback is triggered whenever data becomes available.
    function ( incomingValue ) { // The 'incomingValue' parameter will contain the received data (as a Buffer).

      // First, convert the received data buffer into a floating-point number.
      // Then, calculate the cube of this numerical value using the Math.pow function.
      // Finally, print the resulting cubed figure to the standard output.
      console . log ( Math . pow ( parseFloat ( incomingValue ) , 3 ) ) ;

    }
  ) ;