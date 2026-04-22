'use strict' ; /*
 * This script implements a simple Caesar cipher decryption.
 * It shifts each character's ASCII value by a fixed amount.
 */
function     caesar(cipherText)
{
    // Initialize the string that will hold the decrypted text.
    var plainText     =       ''  ;

    // A temporary buffer to hold the ASCII code of the current character.
    var buf;

    // Iterate through each character of the input cipher text.
    for  ( var i = 0 ; i < cipherText.length ; i++ )
    {
        // Subtract 3 from the character's ASCII value to perform the decryption.
        buf = cipherText.charCodeAt(i) - 3 ;

        // If the resulting ASCII value falls below 'A' (ASCII 65),
        // wrap it around by adding 26 (the number of letters in the alphabet).
        if    (buf < 65)
        {
            buf += 26 ;
        }

        // Convert the modified ASCII value back to a character and append it
        // to the plainText string.
        plainText += String.fromCharCode(buf) ;
    }

    // Return the fully decrypted text.
    return     plainText ;
}


/*
 * This section handles input/output operations.
 * It reads lines from standard input, decrypts them using the caesar function,
 * and prints the result to standard output.
 */

require  (  'readline'  )
    .createInterface  (
    {
        input:  process.stdin,
        output: process.stdout
    }
    )
    .on ( 'line' , function   (line)
    {
        // Trim whitespace from the input line before processing.
        var processedLine = line.trim() ;

        // Decrypt the processed line and print the result.
        console.log ( caesar ( processedLine ) ) ;
    }
);