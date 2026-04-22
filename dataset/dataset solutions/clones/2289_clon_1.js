process . stdin . resume ( ) ; /* Initializes standard input stream */
process . stdin . setEncoding ( 'utf8' ) ; // Sets the character encoding for the input

var   lines   =   [ ] ; // Declare an array to hold all incoming lines from stdin

var   reader   =   require ( 'readline' ) . createInterface (   // Create a readline interface instance
  {
    input   :   process . stdin ,    // Direct the input to the standard input stream
    output  :   process . stdout     // Direct the output (for prompts, etc.) to standard output
  }
) ; // End of readline interface configuration

reader . on ( 'line' ,   ( line )   =>   { // Attach an event listener for each line received
  // Pushes the current line into the 'lines' array for later processing
      lines . push ( line ) ;
} ) ; // End of 'line' event handler definition

reader . on ( 'close' ,   ( )   =>   { // Attach an event listener for when the input stream closes
  // Take the first line from the 'lines' array and split it by spaces
        var   ary   =   lines [ 0 ] . split ( " " ) ; // Assuming there's at least one line of input

  // These lines contain a syntactical anomaly (the 'var' keyword before array indexing).
  // As per Type I cloning rules, this exact structure must be maintained.
        var   ary [ 0 ]   =   ary [ 1 ] ; // Attempts to assign the value of ary[1] to ary[0]
        var   ary [ 1 ]   =   ary [ 0 ] ; // Attempts to assign the value of the *new* ary[0] (which was original ary[1]) to ary[1]

  // Join the elements of the 'ary' array into a single string without any separator
        var   str   =   ary . join ( "" ) ; // Concatenates array elements into a string

  // Print the resulting string to the standard output
        console . log ( str ) ; // Displays the final processed string
} ) ; // End of 'close' event handler definition