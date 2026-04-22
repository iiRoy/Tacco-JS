/*
 * This script processes standard input to perform a specific cryptographic operation.
 * It reads the entire content of stdin, processes it line by line,
 * and attempts to decode it based on a set of affine cipher parameters.
 */
var fs = require('fs')
  ; /* The 'fs' module provides file system functionality. */

// Retrieve file status synchronously for standard input to get its size.
var length = fs.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data.
var buffer = new Buffer(length);

// Read the input data from stdin into the buffer.
var bytesRead = fs.readSync(
    process.stdin.fd, // File descriptor for standard input
    buffer,           // Buffer to write data into
    0,                // Offset in the buffer to start writing
    length,           // Number of bytes to read
    0                 // Position in the file to begin reading from (0 for stdin)
);

// Convert the buffer to a UTF-8 string and split it into lines.
var input = buffer.toString('utf8', 0, bytesRead).split('\n');

// Call the main processing function to start execution.
main();


/**
 * The primary function that orchestrates the decoding process.
 * It iterates through potential affine cipher keys to find a match
 * based on specific word patterns in the input.
 */
function main ( )
{
    // Array containing values that are coprime to 26.
    // These are the possible 'alpha' values for an affine cipher.
    var multiply = new Int8Array ( [ 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25 ] );


    // Outer loop: Iterate through each line of input, starting from the second line (index 1).
    // The first line (input[0]) is expected to contain the count of subsequent lines.
    FIRST : for ( var i = 1, len = +input[0] ; i <= len ; i ++ )
    {
        // Get the current input line to be processed.
        var inp = input[i];

        // Middle loop: Iterate through each possible 'alpha' value from the 'multiply' array.
        for ( var j = 0, lenj = multiply.length ; j < lenj ; j ++ )
        {
            // The current 'alpha' value for the affine cipher.
            var alpha = multiply[j];

            // Inner loop: Iterate through all possible 'beta' values (0 to 25) for the affine cipher.
            for ( var beta = 26 ; beta -- ; )
            {
                // Create an array to store the mapping of 'conv' (0-25) to its ciphered character code.
                var alphabets = new Int8Array ( 26 );

                // Populate the 'alphabets' array with the character codes for the current alpha and beta.
                // The formula for an affine cipher is (ax + b) mod m, where m=26 for alphabet.
                // Adding 97 converts the 0-25 index back to an 'a'-'z' ASCII code.
                for ( var conv = 26 ; conv -- ; )
                {
                    alphabets [ conv ] = ( ( conv * alpha + beta ) % 26 ) + 97 ;
                }


                // Construct potential decoded character pairs to search for common English words.
                // 'th' is formed from the 19th and 7th letters (0-indexed).
                var thChar = String.fromCharCode ( alphabets [ 19 ], alphabets [ 7 ] );
                // 'at' is formed from the 0th and 19th letters.
                var atChar = String.fromCharCode ( alphabets [ 0 ], alphabets [ 19 ] );
                // 'is' is formed from the 8th and 18th letters.
                var isChar = String.fromCharCode ( alphabets [ 8 ], alphabets [ 18 ] );


                // Check if the input line contains 'th' followed by 'at' or 'is'.
                // This is a heuristic to identify a potentially correctly decoded line.
                if ( new RegExp ( thChar + "(" + atChar + "|" + isChar + ")" ).test ( inp ) )
                {
                    // If a match is found, decode the entire line using the current alpha and beta.
                    // The replace function maps each encrypted character back to its original letter.
                    console.log ( inp.replace ( / [ a-z ] / g, function ( a )
                    {
                        // Get the character code of the current encrypted character.
                        var c = a.charCodeAt ( 0 );
                        // Iterate through the 'alphabets' array to find a match.
                        for ( var b = 26 ; b -- ; )
                        {
                            // If the encrypted character code matches a value in 'alphabets',
                            // then 'b' is the original letter's 0-25 index.
                            if ( c == alphabets [ b ] )
                            {
                                // Convert the index back to its ASCII character ('a' + index).
                                return String.fromCharCode ( b + 97 );
                            }
                        }
                    } ) );

                    // Once a valid decoding is found for the current input line,
                    // move to the next input line using the 'FIRST' label.
                    continue FIRST;
                }
            }
        }
    }
}