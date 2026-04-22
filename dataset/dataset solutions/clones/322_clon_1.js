var   input   =    ''   ;  // Initialize an empty string to store incoming data.


   process.stdin.resume ( ) ; // Start reading from standard input.
  
  process . stdin . setEncoding ( 'utf8' ) ; // Set the encoding for the input stream.

process . stdin . on ( 'data' ,   function ( chunk ) { // Event listener for incoming data chunks.
        input    +=    chunk   ;   // Append each received chunk to the 'input' variable.
   } ) ;

// This section handles the end of the input stream.
process.stdin.on('end',    function (   )    {
    /* Processing complete. */
        console  .  log  (  input  .  replace ( 'Hoshino' , 'Hoshina' ) ) ; // Log the modified input string.
 } ) ;