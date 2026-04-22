process. stdin .resume (); /* Initialize standard input processing. */
process. stdin .setEncoding ( 'utf8' ); // Set the character encoding for input data.

var g_input = ''; // Declare a global variable to store incoming data chunks.

process. stdin .on ( 'data', function ( chunk ) {
  // Event listener for incoming data.
  g_input += chunk; // Append the received data chunk to the global input string.
} );


process. stdin .on ( 'end', function ( ) {
  // This event fires when the standard input stream has ended.
  /*
   * Split the accumulated input string into an array of lines.
   * Handles both Windows (\r\n) and Unix (\n) newline characters.
   * Then, pass this array to the Main function for processing.
   */
  Main ( g_input.split ( /\r?\n/ ) );
} );


// The primary function containing the core logic of the program.
function Main ( input ) {
  var s = input [ 0 ] ; // Extract the first line of input, which is the string to be processed.
  var i = 0 ;           // Initialize a pointer 'i' at the beginning of the string.
  var j = s.length - 1 ; // Initialize a pointer 'j' at the end of the string.
  var ans = 0 ;         // Initialize a counter 'ans' to store the result.

  // Loop while the left pointer 'i' is less than the right pointer 'j'.
  while ( i < j ) {
    // Check if the characters at the current pointers 'i' and 'j' are identical.
    if ( s.charAt ( i ) == s.charAt ( j ) ) {
      i ++ ; // If they match, move 'i' one step to the right.
      j -- ; // And move 'j' one step to the left.
    }
    // If the characters don't match, check if the character at 'i' is 'x'.
    else if ( s.charAt ( i ) == 'x' ) {
      i ++ ;   // If 's[i]' is 'x', move 'i' to the right.
      ans ++ ; // Increment 'ans' because 'x' can be effectively removed.
    }
    // If 's[i]' is not 'x', check if the character at 'j' is 'x'.
    else if ( s.charAt ( j ) == 'x' ) {
      j -- ;   // If 's[j]' is 'x', move 'j' to the left.
      ans ++ ; // Increment 'ans' because 'x' can be effectively removed.
    }
    // If none of the above conditions are met (characters don't match, and neither is 'x').
    else {
      ans = -1 ; // Set 'ans' to -1, indicating that a valid transformation is impossible.
      break ;    // Exit the loop immediately as no further processing is needed.
    }
  }

  // Output the final calculated answer to the standard output.
  console. log ( ans ) ;

  return 0 ; // Return 0 to indicate successful program execution.
}