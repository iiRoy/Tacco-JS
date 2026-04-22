process  .  stdin  .  resume ( ) ;

/*
 * This section of the code ensures that the standard input stream
 * is properly configured and prepared to receive data.
 * Specifically, it sets the character encoding to 'utf8'
 * to handle a wide range of characters correctly.
 */
  process
    .
    stdin
    .
    setEncoding ( 'utf8' )
  ;


// Initialize an empty array. This array will later store each line
// that is read from the standard input.
var   lines   =   [ ] ;

// We are using the 'readline' module to create an interface
// that allows us to read input line by line.
var   reader   =   require ( 'readline' ) . createInterface (
  {
    // The input source for the reader is set to standard input.
    input   :   process . stdin ,

    // The output destination for the reader is set to standard output.
    // This is typically used for prompts, but is included for completeness.
    output   :   process . stdout
  }
) ;


// --- Event Handlers for the Readline Interface ---

// This event listener is triggered every time a new line of input
// is received from the standard input stream.
reader . on (
  'line' ,                               // The event name is 'line'.
  ( line )   =>   {                       // The callback function receives the read line as an argument.
    lines . push ( line ) ;             // Add the received line to our 'lines' array.
  }
) ;


// This event listener is triggered when the input stream has ended,
// meaning all data has been read and the stream is closed.
reader . on ( 'close' ,   ( )   =>   {

  // According to the problem's logic, the primary string to process
  // is expected to be the very first line of input.
  var   s   =   lines [ 0 ] ;

  // Initialize a counter. This will keep track of how many times
  // a specific transformation (replacement) occurs.
  var   count   =   0 ;

  // Begin a loop that continues as long as the string 's' contains
  // the substring "ABC".
  while   (   s . includes ( "ABC" )   )   {

    // Inside the loop, replace the *first* occurrence of "ABC" with "BCA".
    // Note: String.prototype.replace() only replaces the first match by default.
    s   =   s . replace ( "ABC" ,   "BCA" ) ;

    // Increment the counter each time a replacement is successfully made.
    count   ++   ;
  }

  // After the loop finishes (i.e., "ABC" is no longer found in 's'),
  // print the final value of the counter to the console.
  console . log ( count ) ;

} ) ;