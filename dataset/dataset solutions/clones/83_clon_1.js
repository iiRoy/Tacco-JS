/*
 * This is a primary function designed to encapsulate
 * the core logic of our script. It processes the
 * accumulated standard input.
 */
function   main ( )
{
  // Outputs the processed input data to the standard console.
  // The input string is converted to uppercase before display.
  console.log(  input.toUpperCase( )  ) ;

} // End of main function definition.


/*
 * Declaration of a global variable 'input'.
 * This variable will be used to store all incoming data
 * from the standard input stream.
 */
var
  input
    =   ''
  ; // Initialized as an empty string.


// Resumes the standard input stream, making it available
// for data reception. This is crucial for event-driven input.
process.stdin
  .resume ( ) ;


// Configures the character encoding for the standard input stream.
// Using 'utf8' ensures proper handling of various character sets.
process
  .stdin
  .setEncoding ( 'utf8' ) ;


// Attaches an event listener to the 'data' event of the
// standard input stream. This function is called every time
// new data (a 'chunk') is received.
process
  .stdin
  .on (
    'data' ,
    function ( chunk )
    {
      // Appends the current data 'chunk' to the 'input' variable.
      // This accumulates all incoming data.
      input
        +=
        chunk
      ;
    }
  ) ;


// Attaches an event listener to the 'end' event of the
// standard input stream. This function is triggered once
// all input data has been received and the stream closes.
process
  .stdin
  .on (
    'end' ,
    function ( )
    {
      // After all data is collected, the main processing function
      // is invoked to handle the complete input.
      main ( ) ;
    }
  ) ;