/*
 * This script is designed to process input data from standard input,
 * specifically to count how many 'board' strings contain a given 'name' pattern
 * in a specific, sequential manner.
 */

// Ensure the standard input stream remains open and active.
process.stdin.resume( );


// Explicitly set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding( 'utf8' );


// Register an event listener for the 'data' event on the standard input stream.
// This function will be executed whenever a chunk of data is received.
process.stdin.on( 'data', function( chunk ) {

    // Split the received data chunk into an array of individual lines,
    // using the newline character as the delimiter.
    var lines = chunk.split( "\n" );


    // The first line of input (index 0) is expected to be a number 'n'.
    // We multiply by 1 to ensure it's treated as a numeric type.
    var n = lines[ 0 ] * 1;


    // The second line of input (index 1) contains the 'name' pattern string
    // that we will be searching for within subsequent lines.
    var name = lines[ 1 ];


    // Declare several variables that will be used as loop counters and for length storage.
    var i, j, len;


    // Initialize a counter to keep track of how many 'board' strings successfully match the 'name' pattern.
    var cnt = 0;


    // Begin a loop that iterates through the 'board' strings.
    // The 'board' strings start from the third line of input (index 2)
    // and continue up to the 'n'-th line (inclusive).
    for ( i = 2; i <= n; i++ ) {

        // Convert the 'name' pattern string into an array of its individual characters.
        var chars = name.split( '' );


        // Retrieve the current 'board' string from the 'lines' array for this iteration.
        var board = lines[ i ];


        // Declare and initialize several variables used for tracking the search process within a 'board' string.
        // 'idx' will store the index of a found character.
        // 'prevIdx' tracks the starting position for the next character search.
        // 'diff' is declared but not explicitly used in the original logic for pattern matching.
        // 'able' is a boolean flag indicating if the current 'board' can match the 'name' pattern.
        var idx, prevIdx = 0, diff = 0, able = true;


        // Store the total number of characters in the 'name' pattern.
        len = chars.length;


        // Start an inner loop to iterate through each character of the 'name' pattern.
        for ( j = 0; j < len; j++ ) {

            // Search for the current character of the 'name' pattern (chars[j])
            // within the 'board' string, starting from 'prevIdx'.
            // board.substr(prevIdx) creates a substring from 'prevIdx' to the end.
            idx = board.substr( prevIdx ).indexOf( chars[ j ] );


            // If the character is not found in the remaining part of the 'board' string (indexOf returns -1).
            if ( idx == -1 ) {

                able = false;    // Set the 'able' flag to false, as the pattern cannot be fully matched.
                break;           // Exit the inner loop immediately, no need to check further characters.
            }


            // Update 'prevIdx' to the new starting position for the next character search.
            // This ensures sequential matching.
            prevIdx = idx;

            // 'prevDiff' is declared but not used in the original logic.
            // It retains the value of 'diff' from the start of the loop iteration.
            prevDiff = diff;
        }


        // After checking all characters of the pattern (or breaking early),
        // if the 'able' flag is still true, it means the pattern was found sequentially.
        if ( able ) {

            cnt++;    // Increment the total count of successful matches.
        }
    }


    // Finally, output the total count of 'board' strings that matched the 'name' pattern
    // to the standard output.
    console.log( cnt );
} );