'use strict'; /*
 * This directive enables strict mode for the entire script.
 * It helps catch common coding errors and "unsafe" actions.
 */


// --- Core Decryption Algorithm: Caesar Cipher ---
// This function takes a ciphered string and decrypts it using a fixed Caesar shift.
function caesar( cipherText )
{
    // Initialize an empty string to accumulate the decrypted characters.
    let plainText = ''; /* The final decrypted message will be stored here. */

    // Declare a variable to temporarily hold the ASCII value of each character.
    // This buffer allows for arithmetic operations on the character's code.
    let buf; // Temporary buffer for character ASCII codes.


    // Loop through each character of the input 'cipherText'.
    for ( let i = 0 ;  i < cipherText.length ;  i++ )
    {
        // Get the ASCII (Unicode) value of the current character.
        // Then, subtract 3 to reverse the Caesar cipher shift (decryption).
        buf = cipherText.charCodeAt( i )  -  3; // Decrypt by shifting back 3 positions.

        // Check if the shifted character's ASCII value has wrapped around
        // below the ASCII value of 'A' (which is 65).
        if ( buf < 65 )
        {
            // If it has wrapped, add 26 to bring it back into the uppercase alphabet range.
            // This handles cases like 'C' decrypting to 'Z', 'B' to 'Y', etc.
            buf += 26; // Alphabet wrap-around correction.
        }

        // Convert the corrected ASCII value back into a character and append it
        // to the 'plainText' string.
        plainText += String.fromCharCode( buf ); // Add the decrypted character to the result.
    } // End of the character iteration loop.


    // Return the complete decrypted string.
    return plainText; // The fully deciphered message.
} // End of the 'caesar' function definition.


// --- Input/Output Operations ---

/*
 * The following commented-out block illustrates an alternative
 * method for handling input, specifically for interactive
 * line-by-line processing using Node.js's 'readline' module.
 * It is currently not in use for this script.
 *
 * require('readline').createInterface({
 *     input: process.stdin, // Standard input stream.
 *     output: process.stdout // Standard output stream.
 * }).on( 'line' ,  (line) => console.log( caesar( line.trim() ) ) );
 */


// This section handles reading input from a file and processing it.
require('fs')
    .readFileSync( '/dev/stdin' ,  'utf8' ) // Synchronously read the entire content of /dev/stdin as UTF-8.
    .trim() // Remove any leading or trailing whitespace from the entire input file content.
    .split( '\n' ) // Split the cleaned input string into an array of strings, where each element is a line.
    .forEach( function ( item ) { // Iterate over each line (referred to as 'item') in the array.
        // For each line, decrypt it using the 'caesar' function and then print the result to the console.
        console.log( caesar( item ) ); // Decrypt the current line and output it.
    } ); // End of the forEach loop, all input lines have been processed.

// Script execution finishes here.