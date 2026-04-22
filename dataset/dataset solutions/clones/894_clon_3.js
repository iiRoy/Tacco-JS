const INPUT_FILE_SOURCE = '/dev/stdin';
const FILE_ENCODING_STANDARD = 'utf8';
const WINDOW_SIZE_CHARACTERS = 8; // Defines the length of the character sequence to analyze.
const SPECIFIC_SORTED_SEQUENCE = 'AADINNUY'; // The desired sorted character pattern.
const REPLACEMENT_VALUE_STRING = 'AIZUNYAN'; // The string to insert upon pattern detection.

// Main execution block wrapped in a try-catch for robust input handling.
try {
    // Acquire the initial raw data stream from the designated input path.
    const rawDataBuffer = require('fs').readFileSync(INPUT_FILE_SOURCE, FILE_ENCODING_STANDARD);

    // Process the acquired data: remove any leading or trailing whitespace characters.
    let currentWorkingText = rawDataBuffer.trim();

    // Implement an early exit condition if the input text is too short
    // to contain even a single window of the required size.
    if (currentWorkingText.length < WINDOW_SIZE_CHARACTERS) {
        console.log(currentWorkingText); // Output the unchanged text.
        process.exit(0); // Terminate successfully as no operations are possible.
    }

    // Initialize an index to traverse the string. The loop condition ensures
    // there's always enough characters remaining to form a full window.
    for (let traversalIndex = 0; traversalIndex <= currentWorkingText.length - WINDOW_SIZE_CHARACTERS; /* increment logic is internal */) {
        // Extract a segment of the current working text based on the window size.
        const segmentUnderExamination = currentWorkingText.substring(traversalIndex, traversalIndex + WINDOW_SIZE_CHARACTERS);

        // Transform the extracted segment: split into individual characters,
        // sort them alphabetically, and then re-join them into a new string.
        const orderedSegmentRepresentation = segmentUnderExamination.split('').sort().join('');

        // Compare the newly ordered segment with the predefined target sequence.
        if (orderedSegmentRepresentation === SPECIFIC_SORTED_SEQUENCE) {
            // If a match is found, proceed with replacing the original segment.
            // Reconstruct the `currentWorkingText` by concatenating parts before,
            // the replacement string, and parts after the replaced segment.
            currentWorkingText = currentWorkingText.slice(0, traversalIndex) +
                                 REPLACEMENT_VALUE_STRING +
                                 currentWorkingText.slice(traversalIndex + WINDOW_SIZE_CHARACTERS);

            // Crucially, advance the traversal index by the full window size.
            // This prevents re-evaluating the newly inserted string and
            // ensures proper progression through the text.
            traversalIndex += WINDOW_SIZE_CHARACTERS;
        } else {
            // If no pattern match in the current window, simply move to the next character.
            traversalIndex++;
        }
    }

    // Once the entire string has been processed, display the final modified text.
    console.log(currentWorkingText);

} catch (dataReadError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`An issue occurred while reading the input: ${dataReadError.message}`);
    process.exit(1); // Terminate with an error code to indicate failure.
}