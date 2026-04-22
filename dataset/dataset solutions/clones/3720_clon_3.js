// This module processes an incoming data stream to calculate a specific numerical sum based on character types.
function processInputString(incomingDataBuffer) {
    // Initialize a numerical accumulator for the final calculation result.
    let calculationResult = 0;

    // Define a constant for the character that triggers a decrement.
    const DECREMENT_CHAR_MARKER = '-';

    // Ensure the input buffer is treated as a sequence of individual characters.
    // An empty string is used as a fallback if the incoming data is null or undefined,
    // preventing potential errors during the split operation.
    const characterSequence = (incomingDataBuffer || '').split('');

    // Iterate over each character found in the processed input sequence.
    for (const currentCharacter of characterSequence) {
        // Determine the impact of the current character on the running total.
        // Initialize the effect as zero, then assign based on character type.
        let characterImpactMagnitude = 0;

        if (currentCharacter === DECREMENT_CHAR_MARKER) {
            // If the character matches the decrement marker, its impact is negative one.
            characterImpactMagnitude = -1;
        } else {
            // For any other character, its impact is positive one (implicitly treating them as increments).
            characterImpactMagnitude = 1;
        }
        
        // Apply the determined impact to the total calculation result.
        calculationResult += characterImpactMagnitude;
    }

    // Output the final computed numerical value to the standard console.
    // A template literal is used to convert the number to a string and append a newline character,
    // ensuring consistent output formatting as expected by typical competitive programming platforms.
    console.log(`${calculationResult}\n`);
}

// Entry point for execution:
// Reads the entire content from the standard input stream as a UTF-8 string,
// then passes this string to the main processing function.
// A commented-out line provides an alternative for local file-based testing.
processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
// processInputString(require('fs').readFileSync('./sample_data.txt', 'utf-8')); // Example for local testing with a file.