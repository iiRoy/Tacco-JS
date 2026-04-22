// This module sets up a listener for incoming standard input.
// It ensures that any data received from stdin is immediately echoed to stdout.

  process
    .stdin
    .resume (
    ) ; // Begin reading from the standard input stream, enabling data flow.

/*
 * Configure the character encoding for the input stream.
 * 'utf8' is chosen here for its broad compatibility with textual data.
 */
process
  .stdin
  .setEncoding ( 'utf8' ) ;

// Attach an event handler to the 'data' event of the standard input.
// This callback executes each time new data becomes available.
process
  .stdin
  .on (
    'data',
    function ( incomingBuffer )   {
      // Output the collected segment of input directly to the console.
      // This action effectively mirrors the input to the output.
      console.log ( incomingBuffer ) ;
    }
  ) ;