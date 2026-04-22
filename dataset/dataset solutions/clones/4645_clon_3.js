// This module defines a function to process raw textual input, specifically designed
// to interleave characters from the first two lines of the provided content.

/**
 * Processes a multi-line string by interleaving characters from its first two lines.
 * The result is printed to the console.
 *
 * @param {string} sourceContent - The entire raw input string, expected to contain
 *                                 at least two newline-separated lines.
 */
function processInputData(sourceContent) {
    // Validate the input type: Ensure that the provided content is indeed a string.
    // If not, log an error and terminate the operation gracefully by returning early.
    if (typeof sourceContent !== 'string') {
        console.error("Error: The provided content for processing must be a string type.");
        return; // Exit the function, as invalid input cannot be processed.
    }

    // Divide the comprehensive input string into an array of individual lines.
    // Each line is separated by a newline character, effectively parsing the input.
    const contentSegments = sourceContent.split('\n');

    // Implement a validation check: Verify if there are sufficient lines for interleaving.
    // We require at least two lines. If fewer are present, issue a warning.
    if (contentSegments.length < 2) {
        console.warn("Warning: Insufficient input lines detected. At least two lines are expected for character interleaving.");
        // Proceeding with potentially fewer lines, but using empty strings as fallbacks
        // to prevent runtime errors from accessing undefined array elements.
    }

    // Extract the first line and convert it into an array of characters.
    // Array.from() is used for a modern and explicit conversion.
    // A fallback of an empty string ('') ensures that even if contentSegments[0] is undefined,
    // we still create an empty array, preventing errors.
    let primaryCharacterSeries = Array.from(contentSegments[0] || '');

    // Similarly, extract the second line and transform it into a character array.
    // This line also utilizes the empty string fallback for robustness.
    let secondaryCharacterSeries = Array.from(contentSegments[1] || '');

    // Initialize an empty array to accumulate the interleaved characters.
    // Building an array and then joining it at the end is generally more efficient
    // for string construction within loops compared to repeated string concatenation.
    const resultingCharacterSequence = [];

    // Begin the interleaving process. The loop continues as long as there are
    // characters remaining in either of the two source series.
    while (primaryCharacterSeries.length > 0 || secondaryCharacterSeries.length > 0) {
        // If the primary series still contains characters, extract and append the first one.
        // The .shift() method removes the character from the beginning of the array and returns it.
        if (primaryCharacterSeries.length > 0) {
            resultingCharacterSequence.push(primaryCharacterSeries.shift());
        }

        // In the same manner, if the secondary series has characters, extract and append its first.
        if (secondaryCharacterSeries.length > 0) {
            resultingCharacterSequence.push(secondaryCharacterSeries.shift());
        }
        // The loop naturally terminates once both primaryCharacterSeries and secondaryCharacterSeries
        // become empty, as their lengths will both be zero.
    }

    // Concatenate all characters collected in the `resultingCharacterSequence` array
    // into a single, cohesive string. This forms the final interleaved output.
    const finalInterleavedText = resultingCharacterSequence.join('');

    // Output the ultimate interleaved string to the standard console output.
    console.log(finalInterleavedText);
}

// Entry point for execution:
// Reads data from standard input (typically '/dev/stdin' on Unix-like systems)
// using Node.js's 'fs' module. The 'utf8' encoding ensures correct character interpretation.
// The synchronously read content is then passed to our `processInputData` function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));