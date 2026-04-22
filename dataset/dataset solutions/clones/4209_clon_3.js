// This module is designed to evaluate an input string against a predefined pattern,
// specifically checking if it can be transformed into "AKIHABARA" through
// a series of targeted character insertions. The core logic focuses on
// ensuring 'A's are present at certain key positions.

/**
 * Defines the ultimate target string that the input sequence should match after processing.
 * This constant makes the target pattern explicit and easily modifiable.
 * @type {string}
 */
const EXPECTED_FINAL_SEQUENCE = "AKIHABARA";

/**
 * Specifies the character that must be strategically inserted into the sequence.
 * @type {string}
 */
const MANDATORY_INSERT_CHAR = 'A';

/**
 * Analyzes and processes an input string to determine if it can form the target sequence.
 * It modifies the string by inserting 'A' characters at specific points if they are missing.
 *
 * @param {string} initialTextualData - The raw input string provided for validation.
 */
function processAndValidatePattern(initialTextualData) {

    // Step 1: Prepare the input data.
    // First, remove any leading or trailing whitespace to normalize the input.
    // Then, convert the cleaned string into an array of individual characters.
    // Using `[...string]` or `Array.from(string)` is a modern way to split into characters.
    let currentCharacterSequence = [...initialTextualData.trim()];

    // Step 2: Define the critical positions where 'A' characters are expected or required.
    // These indices dictate where the insertion logic will focus.
    const specificInsertionIndices = Object.freeze([0, 4, 6, 8]); // Using Object.freeze for immutability

    // Step 3: Iterate through the predefined critical positions and perform conditional insertions.
    // This loop ensures that each of the specified positions contains the mandatory 'A' character.
    for (let pointIterator = 0; pointIterator < specificInsertionIndices.length; ++pointIterator) {
        const currentTargetIndex = specificInsertionIndices[pointIterator];

        // Guard clause: Ensure the index is non-negative. While our specific indices are positive,
        // this adds robustness for more general usage patterns.
        if (currentTargetIndex < 0) {
            console.warn(`Encountered an invalid negative index: ${currentTargetIndex}. Skipping.`);
            continue; // Move to the next point if the index is invalid.
        }

        // Check the character at the current target index in our mutable sequence.
        // If the character is not the mandatory 'A' (or if the index is out of bounds,
        // making `currentCharacterSequence[currentTargetIndex]` `undefined`),
        // then an 'A' needs to be inserted at this exact position.
        if (currentCharacterSequence[currentTargetIndex] !== MANDATORY_INSERT_CHAR) {
            // Perform the insertion: `splice(index, deleteCount, item1, ...)`.
            // Here, `deleteCount` is 0, meaning no existing characters are removed.
            currentCharacterSequence.splice(currentTargetIndex, 0, MANDATORY_INSERT_CHAR);
        }
    }

    // Step 4: Reconstruct the string from the potentially modified character array.
    // This gives us the final form of the input after all 'A' insertions.
    const generatedStringResult = currentCharacterSequence.join('');

    // Step 5: Compare the generated string with the globally defined expected sequence.
    let doesResultMatchTarget = false;
    if (generatedStringResult === EXPECTED_FINAL_SEQUENCE) {
        doesResultMatchTarget = true;
    }

    // Step 6: Output the final determination.
    // Based on the comparison, print "YES" if it matches, otherwise "NO".
    if (doesResultMatchTarget) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

// Main execution block: Handles reading input from standard input and initiating the processing.
// This part is highly dependent on the execution environment (e.g., Node.js).
const fileSystemUtility = require('fs');
const standardInputFilePath = '/dev/stdin';
const dataEncodingFormat = 'utf8';

try {
    // Read the entire content of the standard input file synchronously.
    const rawInputContent = fileSystemUtility.readFileSync(standardInputFilePath, dataEncodingFormat);

    // Pass the acquired raw content to our primary processing function.
    processAndValidatePattern(rawInputContent);
} catch (ioError) {
    // Robust error handling for file system operations.
    // If reading from /dev/stdin fails, log the error and exit gracefully with an error code.
    console.error(`Error reading input from ${standardInputFilePath}: ${ioError.message}`);
    process.exit(1); // Indicate an abnormal termination.
}