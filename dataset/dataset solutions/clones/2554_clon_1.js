/*
 * This JavaScript file defines a function to validate a specific type of
 * "tap dance" sequence based on character rules for odd and even positions.
 * It's a simple validation logic example.
 */

function main ( tapDance ) {

    // Allowed characters for positions that are considered "odd" in a 1-based indexing system.
    // When converted to 0-based array index, these correspond to (i-1) where i is odd.
    const odd = [ 'R', 'U', 'D' ];

    // Allowed characters for positions that are considered "even" in a 1-based indexing system.
    // When converted to 0-based array index, these correspond to (i-1) where i is even.
    const even = [ 'L', 'U', 'D' ];


    // Handle the edge case where the input sequence has only one character.
    if ( tapDance.length === 1 ) {

        // If the single character is 'L', it's an invalid sequence according to the rules.
        if ( tapDance === 'L' ) {

            return 'No'; // Immediately exit and report "No" for invalid input.

        }

    }


    // Loop through the tap dance sequence, starting from the second character (index 1).
    // The loop variable 'i' represents the 1-based position in the sequence for validation logic.
    for ( var i = 1; i < tapDance.length; i ++ ) {

        // Check if the current 1-based position 'i' is an odd number.
        if ( i % 2 == 1 ) {

            // Processing for an odd-numbered position in the sequence.
            // Check if the character at the corresponding 0-based index (i-1) is in the 'odd' allowed set.
            if ( odd.indexOf( tapDance[ i - 1 ] ) !== -1 ) {

                continue; // If valid, proceed to the next character in the sequence.

            }
            else {

                return 'No'; // If the character is not allowed, the sequence is invalid.

            }

        }
        else { // The current 1-based position 'i' is an even number.

            // Processing for an even-numbered position in the sequence.
            // Check if the character at the corresponding 0-based index (i-1) is in the 'even' allowed set.
            if ( even.indexOf( tapDance[ i - 1 ] ) !== -1 ) {

                continue; // If valid, proceed to the next character.

            }
            else {

                return 'No'; // If the character is not allowed, the sequence is invalid.

            }

        }

    } // End of the main validation loop.


    // If the loop completes without finding any invalid characters, the sequence is valid.
    return 'Yes';

} // End of the main function definition.


// This single line handles the input/output operations:
// 1. Reads content from /dev/stdin.
// 2. Decodes it as UTF-8.
// 3. Splits by newline and takes the first line.
// 4. Trims whitespace from the line.
// 5. Passes the processed string to the 'main' function.
// 6. Logs the result returned by 'main' to the console (stdout).
console.log( main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).split( '\n' )[ 0 ].trim() ) );