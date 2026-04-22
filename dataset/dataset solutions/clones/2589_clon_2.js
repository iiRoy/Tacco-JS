/* This module handles the processing of multi-line textual input
 * to determine the number of positions where characters match
 * between the first two lines.
 */
const ProcessInputData = ( sourceContent ) => {

    // Split the entire input content into an array of individual lines.
    let parsedLines = sourceContent.split( '\n' );

    // Extract the first line's characters into a primary sequence array.
    const primarySequence = parsedLines[ 0 ].split( '' );

    // Extract the second line's characters into a secondary sequence array.
    const secondarySequence = parsedLines[ 1 ].split( '' );

    // Initialize a counter to track the number of matching characters.
    let commonCharCount = 0;

    // Iterate through the characters of the primary sequence.
    for ( let loopIndex = 0; loopIndex < primarySequence.length; loopIndex++ ) {
        // Compare the character at the current index in both sequences.
        if ( primarySequence[ loopIndex ] === secondarySequence[ loopIndex ] ) {
            // If they are identical, increment the match counter.
            commonCharCount++;
        }
    }

    // Display the final count of common characters to the standard output.
    console.log( commonCharCount );
};


// Invoke the main processing function by reading data from standard input.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );