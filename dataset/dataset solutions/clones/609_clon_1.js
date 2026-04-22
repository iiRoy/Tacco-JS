/*
 * This script is designed to process input from standard input.
 * It reads lines of text and performs a specific pattern matching operation.
 */

// Ensure the standard input stream remains open.
process.stdin.resume();


// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding( 'utf8' );


/*
 * Event listener for incoming 'data' chunks from standard input.
 * This function will be executed whenever data is available.
 */
process.stdin.on( 'data', function ( chunk )
{
    // Split the incoming data chunk into individual lines based on the newline character.
    var lines = chunk.split( "\n" );


    // The first line contains the number 'n', which is cast to a number.
    var n = lines[ 0 ] * 1;

    // The second line contains the 'name' string to be matched.
    var name = lines[ 1 ];


    // Declare loop counter and length variables early, for scoping.
    var i, j, len;


    // Initialize a counter for successful matches; this will store the final result.
    var cnt = 0;


    /*
     * Main loop: Iterate through the remaining lines, starting from the third line (index 2).
     * This loop processes each 'board' string provided in the input.
     * It runs 'n' times, covering lines[2] through lines[n+1].
     */
    for ( i = 2; i < n + 2; i++ )
    {
        // Convert the 'name' string into an array of characters.
        // This makes individual character access and comparison easier.
        var chars = name.split( '' );

        // The current line from the input is designated as the 'board' string.
        var board = lines[ i ];


        // Declare variables for index calculation, difference, and a boolean flag.
        var idx;
        var diff;
        var able = false; // Flag to indicate if a match was found for the current 'board' string.


        // Get the length of the current 'board' string for loop boundaries.
        var l = board.length;


        /*
         * Outer nested loop: Iterates through possible 'diff' values.
         * The 'diff' variable represents an offset or a pattern modifier.
         * It tries different ways to match the 'name' pattern within the 'board'.
         */
        for ( diff = 0; diff < l; diff++ )
        {
            // Re-get the length of the 'chars' array (which is the length of 'name').
            // This is done inside the loop, though its value remains constant.
            len = chars.length;

            /*
             * Inner nested loop: Iterates through each character of the 'name' pattern.
             * This loop compares characters from 'chars' with characters from 'board'
             * based on the current 'diff' value.
             */
            for ( j = 0; j < len; j++ )
            {
                // Calculate the specific index in the 'board' string to check.
                // The formula `j + diff * j` defines the matching pattern.
                idx = j + diff * j;

                // Condition for a match:
                // 1. The character at the calculated 'idx' in 'board' must match the 'j'-th character in 'chars'.
                // 2. This comparison must be for the *last* character of the 'chars' sequence (i.e., `j == len - 1`).
                //    This implies the entire 'name' pattern must have been matched up to this point.
                if ( ( board[ idx ] == chars[ j ] ) && ( j == len - 1 ) )
                {
                    // If both conditions are met, a successful match for the current 'board' is found.
                    able = true;

                    // Since a match is confirmed, there's no need to check further characters
                    // for this specific 'diff' value; break out of the inner 'j' loop.
                    break;
                }
            }


            // After the inner 'j' loop completes for a given 'diff':
            // If 'able' is true, it means a match was found with the current 'diff'.
            // Therefore, we can stop trying other 'diff' values for this 'board'.
            if ( able )
            {
                break;
            }
        }

        // After all 'diff' values have been tried for the current 'board':
        // If 'able' is true, it means the 'name' pattern was successfully matched in the 'board'.
        if ( able )
        {
            // Increment the total count of boards that contain the pattern.
            cnt++;
        }
    }

    // Finally, output the total count of boards that successfully matched the 'name' pattern.
    console.log( cnt );
} );