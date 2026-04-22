'use strict' ; /* This directive enables strict mode, ensuring cleaner code practices. */

// --- Core Decryption Logic (PROCESS) ---
// This function implements the Caesar cipher decryption algorithm.
function caesar ( cipherText )
{
  var plainText = '' ; // Initialize an empty string to store the final decrypted text.

  // 'buf' will temporarily hold the ASCII code of each character during processing.
  var buf ; /* This variable acts as a buffer for character codes. */

  // Iterate over each character in the provided cipherText string.
  for( var i = 0 ; i < cipherText.length ; i++ )
  {
    // Get the ASCII code of the current character and shift it back by 3 positions.
    buf = cipherText.charCodeAt( i ) - 3 ;

    // If the shifted character code falls below the ASCII value of 'A' (65),
    // it means it has wrapped around the alphabet.
    if ( buf < 65 )
    {
      buf += 26 ; // Add 26 to bring it back into the valid uppercase alphabet range (A-Z).
    }

    // Convert the adjusted ASCII code back to a character and append it to plainText.
    plainText += String.fromCharCode( buf ) ;
  } // End of the character iteration loop.

  // Return the fully decrypted string.
  return plainText ;
} /* End of the caesar function definition. */


// --- Input/Output Handling (IO RAW) ---
// The following block handles reading input and processing it using the 'caesar' function.

/*
// This commented-out section shows an alternative method for reading input
// line by line using the 'readline' module, which is suitable for interactive
// command-line input.
require ( 'readline' ) .createInterface( {
    input: process.stdin ,
    output: process.stdout
} ) .on( 'line' , ( line ) => console.log( caesar( line.trim() ) ) ) ;
*/

// This approach uses the 'fs' (file system) module to read the entire content
// of '/dev/stdin' (standard input) synchronously.
require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' ) // Read the entire input as a UTF-8 string.
  .trim() // Remove any leading or trailing whitespace from the entire input.
  .split( '\n' ) // Split the input string into an array of lines.
  .forEach( function ( item ) // Iterate over each line (item) in the array.
  {
    // For each line, decrypt it using the 'caesar' function and print the result to the console.
    console.log( caesar( item ) ) ;
  } ) ; // Concludes the forEach loop.