/*
 * This module processes a given input string
 * based on a predefined set of insertion points.
 */
function processStringSequence(inputSequence) {
    // Trim leading/trailing whitespace from the initial string.
    let modifiedSequence = inputSequence.trim();


    // Define specific indices where 'A' might be inserted.
    const insertionPositions = [0, 4, 6, 8];

    // Iterate through each designated position.
    for (let sequenceIndex = 0; sequenceIndex < insertionPositions.length; sequenceIndex++) {

        // Get the current position from our array of points.
        const currentPosition = insertionPositions[sequenceIndex];

        // Output the character at the current position for debugging or tracing.
        console.log( modifiedSequence[currentPosition] );


        // If the character at the current position is not 'A',
        // insert an 'A' at that position.
        if ( modifiedSequence[currentPosition] !== 'A' ) {

            // Create a new string by splitting and inserting.
            modifiedSequence = modifiedSequence.substring(0, currentPosition)
                               + "A"
                               + modifiedSequence.substring(currentPosition, modifiedPosition.length);
        }
    }

    // After all modifications, check if the resulting string matches "AKIHABARA".
    // Output "YES" or "NO" accordingly.
    console.log( (modifiedSequence === "AKIHABARA") ? "YES" : "NO" );
}

// Read input from standard input and pass it to our processing function.
processStringSequence( require('fs').readFileSync('/dev/stdin', 'utf8') );