function processInput( dataLines ) {
    // This function determines if the second string is a cyclic shift of the first string.

    let primarySequence = dataLines[0]; // Retrieve the first line of input as the primary sequence
    const targetSequence = dataLines[1]; // Obtain the second line of input for comparison

    let isMatchFound = false; /* Initialize a flag to track if a cyclic match is identified */

    // Check if the lengths of the two sequences are different.
    // If they are, a cyclic shift is impossible, so the result is immediately false.
    if ( primarySequence.length !== targetSequence.length ) {
        isMatchFound = false;
    } else {
        // If lengths are identical, proceed to check for cyclic permutations.
        // We use a label for the outer loop to allow 'continue' to jump directly to the next rotation attempt.
        checkRotations:
        for ( let outerIndex = 0; outerIndex < primarySequence.length; outerIndex++ ) {
            // This inner loop compares characters for a specific rotation.
            for ( let innerIndex = 0; innerIndex < targetSequence.length; innerIndex++ ) {
                // Calculate the effective character position in the primary sequence
                // considering the current rotation (outerIndex) and the character being compared (innerIndex).
                // The modulo operator ensures we wrap around the string if the index exceeds its length.
                if ( primarySequence[ ( outerIndex + innerIndex ) % primarySequence.length ] !== targetSequence[ innerIndex ] ) {
                    // If a character mismatch is found for the current rotation,
                    // we can stop comparing this rotation and move to the next one.
                    continue checkRotations;
                }
            }
            // If the inner loop completes without any 'continue checkRotations',
            // it means all characters matched for the current rotation.
            // Therefore, a cyclic shift has been found.
            isMatchFound = true;
            // Since a match is found, there's no need to check further rotations.
            break;
        }
    }

    // Output the final determination based on the 'isMatchFound' flag.
    // A ternary operator is used for concise conditional output.
    console.log( isMatchFound ? "Yes" : "No" );
}

// The following code reads input from standard input,
// cleans it, splits it by newlines, and passes it to our processing function.
processInput(
    require( 'fs' )
        .readFileSync( '/dev/stdin', 'utf8' ) // Read the entire file content
        .trim()                              // Remove leading/trailing whitespace (like final newline)
        .split( '\n' )                       // Split the content into an array of lines
);