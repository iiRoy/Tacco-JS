/*
 * This section declares core variables required for the script's operation.
 * These variables hold intermediate data and the final output status.
 */
var lines = [];                                    // An array to store all input lines from stdin.

// A hash map (object) to efficiently check for previously encountered strings.
// This helps in verifying the 'spelling' or sequence connectivity,
// ensuring no word is repeated and word chaining rules are followed.
var checkSpell = {};

var stdout = "Yes";                                // This variable will store the final output string.
                                                   // Defaulting to "Yes", it will be changed to "No" if a condition is violated.

var lastWord = null;                               // Stores the last character of the previous word,
                                                   // initialized to null as there's no previous word at start.


// --- Input/Output Handling Setup ---
// Utilizing the 'readline' module to process input line by line from the standard input.
var reader = require( 'readline' ).createInterface( {
    input: process.stdin,                          // Standard input stream.
    output: process.stdout                         // Standard output stream (though not directly used for echoing here).
} );


// Register a callback for each line received from the input.
reader.on( 'line', function( line ) {
    // Each line read is added to the 'lines' array for later processing.
    lines.push( line );
} );


// Register a callback for when the input stream closes.
// This is where the main logic of the program resides,
// executing once all input has been received.
reader.on( 'close', function() {

    // Re-initialize checkSpell here for the main processing loop.
    // This ensures a clean state for the word uniqueness check within this scope.
    var checkSpell = {};

    // The first line of input (lines[0]) is assumed to be the count of subsequent words.
    // The loop iterates from the second line (index 1) up to the count specified by lines[0].
    for ( var i = 1; i < lines[0]; i++ ) {

        // Get the current string (word) from the input lines array.
        var str = lines[i];

        // --- Core Logic: Check for sequence validity and uniqueness ---
        // This 'if' condition checks two main criteria to determine if the sequence is broken:
        // 1. If the current string 'str' has already been encountered (checkSpell[str] != undefined).
        //    This checks for word repetition.
        // 2. If it's not the very first word being checked (lastWord != null) AND
        //    the first character of the current string (str.slice(0,1)) does NOT match
        //    the last character of the previous string (lastWord).
        //    This checks for the chaining rule (e.g., "apple" -> "elephant").
        if ( ( checkSpell[str] != undefined ) || ( ( lastWord != null ) && ( str.slice( 0, 1 ) != lastWord ) ) ) {

            // If any of the above conditions are true, it means the sequence is invalid.
            // Print the offending string to console (for debugging/identification purposes).
            console.log( str );

            // Set the final output status to "No" as the rules have been violated.
            stdout = "No";

            // Terminate the loop immediately as the condition is already violated
            // and no further checks are necessary.
            break;

        }

        // If the string is valid so far (i.e., passed the 'if' check),
        // mark it as 'exists' in the hash map to prevent future repetitions.
        checkSpell[str] = 'exists';

        // Update 'lastWord' to be the last character of the current string.
        // This value will be used in the next iteration to check the subsequent string's first character.
        lastWord = str.slice( 0, -1 );

    }

    // Finally, after processing all relevant lines or breaking early,
    // print the determined status ("Yes" or "No") to standard output.
    console.log( stdout );

} );