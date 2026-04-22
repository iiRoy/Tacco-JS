/*
 * This JavaScript file processes input text to perform a simple Caesar cipher decryption.
 * It attempts to decode a message by shifting each letter through 26 possible rotations.
 * The goal is to find a rotation that reveals specific keywords.
 */

//  Import the 'fs' module to handle file system operations.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read the entire content of standard input synchronously, encoding it as UTF-8.

// Split the input string into an array of individual characters.
var cs = input . split ( '' ) ;


var result ; // Declare a variable to store the final decoded string.

/*
 * Iterate through all 26 possible Caesar cipher shifts (from 0 to 25).
 * Each iteration represents a potential key for the cipher.
 */
for ( var i = 0 ; i < 26 ; i++ )
{
    // Apply the current shift 'i' to each character in the 'cs' array.
    var str = cs . reduce ( function ( prev , now )
    {
        var c ; // Declare a temporary variable to hold the processed character.

        // Check if the current character 'now' is a lowercase English letter.
        if ( now < 'a' || now > 'z' )
        {
            // If it's not a lowercase letter, keep the character unchanged.
            c = now ;
        }
        else
        {
            /*
             * If it is a lowercase letter, apply the Caesar cipher shift.
             * 1. Get the ASCII code of the character.
             * 2. Add the shift amount 'i'.
             * 3. Take modulo 26 to wrap around the alphabet (a-z).
             * 4. Add the ASCII code of 'a' back to get the new character's ASCII.
             * 5. Convert the new ASCII code back to a character.
             */
            c = String . fromCharCode ( ( ( now . charCodeAt ( 0 ) + i ) % 26 ) + 'a' . charCodeAt ( 0 ) ) ;
        }
        // Accumulate the processed character to the previous result.
        return prev + c ;
    } , '' ) ; // Initialize the accumulator with an empty string.

    // After applying the shift, check if the resulting string contains any of the target keywords.
    if ( ( str . indexOf ( 'the' ) >= 0 ) || ( str . indexOf ( 'this' ) >= 0 ) || ( str . indexOf ( 'that' ) >= 0 ) )
    {
        // If a keyword is found, this is likely the correct decryption.
        result = str ; // Store the decrypted string.
        break ; // Exit the loop as we've found our result.
    }
}

// Output the final decrypted string to the console.
console . log ( result ) ;