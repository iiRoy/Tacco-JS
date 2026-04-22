/*
 * This function processes input text to count occurrences of a specific word.
 * It reads the word to be searched for and then iterates through lines of text
 * until an "END_OF_TEXT" marker is found.
 */
function   Main   ( input )
{
  // First, split the entire input string by newline characters into an array of lines.
  input   =   input.split ( "\n" ) ;

  // The very first line of the input is expected to be the word we are searching for.
  var   w   =   input.shift ( ) ;
  // Convert the search word to uppercase to ensure case-insensitive matching.
  w   =   w.toUpperCase ( ) ;


  // Get the next line from the input, which is the first line of text to be processed.
  var   str   =   input.shift ( ) ;
  // Convert this line of text to uppercase for consistent comparison.
  str   =   str.toUpperCase ( ) ;


  // Initialize a counter for the number of times the word is found.
  var   res   =   0 ;


  /*
   * This is the main loop that processes the text.
   * It continues as long as the current line of text is not the "END_OF_TEXT" sentinel.
   */
  while ( str   !=   "END_OF_TEXT" )
  {
    // Split the current line of text by whitespace or newlines into individual words.
    // This handles cases where a line might contain multiple words.
    str   =   str.split ( /\s|\n/ ) ;

    // Iterate over each word obtained from the current line.
    str.forEach ( function ( s ) {
      // Check if the current word 's' exactly matches our target word 'w'.
      if ( s   ==   w )
      {
        // If a match is found, increment the result counter.
        res   +=   1 ;
        // No need to continue checking other words in the current line if a match is found,
        // although 'forEach' will continue; 'return' here only exits the callback for this 's'.
        return ;
      }
    } ) ;


    // After processing all words in the current line, get the next line from the input.
    str   =   input.shift ( ) ;
    // Convert the new line of text to uppercase for the next iteration.
    str   =   str.toUpperCase ( ) ;
  }


  // Once the "END_OF_TEXT" marker is encountered, print the final count of the word occurrences.
  console.log ( res ) ;
}


/*
 * This section executes the Main function.
 * It reads the entire content of standard input as a UTF-8 string
 * and passes it to the Main function for processing.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;