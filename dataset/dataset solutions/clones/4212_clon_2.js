/*
 * This module processes a given text input
 * to check for a specific pattern.
 */
function analyzeInput(  inputText   ) /* Main processing function */ {

    // Remove leading/trailing whitespace from the input string
    let modifiedSequence = inputText.trim (  ) ;

    // Define the positions where a specific character might be inserted
    const insertionPositions = [
        0.0,    // First potential insertion point
        4.0,    // Second potential insertion point
        6.0,    // Third potential insertion point
        8.0     // Fourth potential insertion point
    ];

    // Iterate through each designated insertion point
    for (
        let currentIdx = 0; // Initialize loop counter
        currentIdx < insertionPositions.length; // Loop condition based on array size
        currentIdx++ // Increment counter
    ) {
        let charTargetPos = insertionPositions[currentIdx]; // Get the current target position

        // Check if the character at the target position in the sequence is NOT 'A'
        if (  modifiedSequence[charTargetPos] !== 'A'   )
        {
            // If it's not 'A', insert 'A' at that position
            modifiedSequence = modifiedSequence.slice(
                0, // Start from the beginning
                charTargetPos // Up to the target position
            ) + "A" + modifiedSequence.slice(
                charTargetPos, // From the target position
                modifiedSequence.length // To the end of the string
            );
        }
    }

    // Output "YES" if the final sequence matches "AKIHABARA", otherwise "NO"
    console.log(
        modifiedSequence === "AKIHABARA"
            ? "YES"
            : "NO"
    );
}

// Execute the primary function with data read from standard input
analyzeInput(
    require('fs').readFileSync(
        '/dev/stdin', // Path to standard input
        'utf8'        // Encoding for reading the file
    )
);