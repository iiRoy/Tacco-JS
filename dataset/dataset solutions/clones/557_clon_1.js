'use strict'; /*  Strict mode enabled for cleaner code.  */

/*
 * This section defines the core logic for the Caesar cipher decryption.
 * It takes a ciphertext string and returns the corresponding plaintext.
 */
function caesar( cipherText )
{
  let plainText  = ''; // Initializes an empty string to build the decrypted text.

  /*
   * 'buf' will temporarily store the ASCII code of each character
   * after decryption, before converting it back to a character.
   */
  let buf;

  // Loop through each character of the input ciphertext.
  for ( let i = 0; i < cipherText.length; i++ )
  {
      // Subtract 3 from the ASCII code to shift it back.
      buf = cipherText.charCodeAt( i ) - 3;

      // If the character wraps around (goes below 'A'), bring it back into the alphabet range.
      if ( buf < 65 )
      {
          buf += 26; // Add 26 to shift it back into the uppercase alphabet (A=65).
      }
      // Append the decrypted character to the plaintext string.
      plainText += String.fromCharCode( buf );
  } // End of character processing loop.

  // Return the fully decrypted plaintext.
  return plainText;
} /* End of caesar function definition */


/*
 * This section handles Input/Output operations using Node.js's 'readline' module.
 * It reads a line from standard input, decrypts it, and prints to standard output.
 */
const rl = require( 'readline' ) . createInterface( {
    input   : process.stdin,  // Set input source to standard input.
    output  : process.stdout  // Set output destination to standard output.
} ); // End of readline interface creation.


// Event listener for when a new line of input is received.
rl . on( 'line', ( line ) => {
    // Decrypt the trimmed input line and print the result to the console.
    console . log( caesar( line . trim( ) ) );

    // Close the readline interface after processing the first line.
    rl . close( );
} ); // End of 'line' event handler.