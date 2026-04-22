/**
 * A program to process character sequence manipulations and queries.
 * This implementation handles two types of operations:
 * 1. Updating a character at a specific position.
 * 2. Counting unique characters within a given range.
 *
 * This is a Type III clone, featuring extensive renaming, structural changes,
 * and the addition/removal of code fragments while preserving core functionality.
 */

/**
 * Parses and processes the provided raw input data, executing character sequence operations.
 * @param {string} rawInput The raw input string, typically sourced from standard input.
 */
function processInputData(rawInput) {
    // Ensure the input is clean by trimming whitespace and splitting into individual lines.
    const inputLines = rawInput.trim().split('\n');

    // A utility function to convert a string to an integer with radix 10.
    const convertToInteger = (strValue) => parseInt(strValue, 10);

    // Extract initial configuration parameters from the first few lines of input.
    const sequenceLength = convertToInteger(inputLines[0]); // N: The total length of the character sequence.
    const initialSequenceString = inputLines[1];            // S: The original character sequence.
    const numberOfQueries = convertToInteger(inputLines[2]); // Q: The total number of operations to be performed.

    // Initialize the character buffer as a mutable array, derived from the initial string.
    // Using Array.from() provides a clear and explicit conversion.
    let mutableCharBuffer = Array.from(initialSequenceString);

    // --- Prepare the list of operations for execution ---
    // Query specifications begin from the fourth line (index 3) of the input.
    const queriesStartingLineIndex = 3;
    // Extract only the relevant lines that contain the operation details.
    const queryDefinitions = inputLines.slice(queriesStartingLineIndex, queriesStartingLineIndex + numberOfQueries);

    // Helper function for unified output logging.
    const emitOutput = (valueToPrint) => {
        console.log(valueToPrint);
    };

    // Iterate over each defined operation and execute it.
    for (const currentQueryString of queryDefinitions) {
        // Split the current query string into its constituent parts.
        const queryComponents = currentQueryString.split(' ');
        const operationType = convertToInteger(queryComponents[0]); // The identifier for the operation type (1 or 2).

        // Utilize a switch statement to dispatch actions based on the operation type.
        switch (operationType) {
            case 1: { // Type 1: Character Replacement Operation
                // Parse the specific parameters for a character update.
                const targetPosition = convertToInteger(queryComponents[1]); // 1-based index for the character to modify.
                const replacementChar = queryComponents[2];                 // The new character to insert.

                // Perform bounds checking to ensure the target position is valid.
                // Positions are 1-based in input, convert to 0-based for array access.
                if (targetPosition >= 1 && targetPosition <= sequenceLength) {
                    const bufferIndex = targetPosition - 1;
                    // Only apply the update if the character is genuinely different,
                    // which can be a minor optimization to avoid unnecessary writes.
                    if (mutableCharBuffer[bufferIndex] !== replacementChar) {
                        mutableCharBuffer[bufferIndex] = replacementChar;
                    }
                }
                // (Optional) For invalid indices, one might log a warning or throw an error.
                // In competitive programming, input validity is often assumed.
                break;
            }

            case 2: { // Type 2: Distinct Character Count within a Range
                // Parse the boundary parameters for the range query.
                const lowerBound = convertToInteger(queryComponents[1]); // 1-based start of the query range.
                const upperBound = convertToInteger(queryComponents[2]); // 1-based end of the query range.

                // Validate the query range: it must be within sequence bounds and start before or at the end.
                if (lowerBound >= 1 && upperBound <= sequenceLength && lowerBound <= upperBound) {
                    // Use a Set data structure to efficiently collect and track unique characters.
                    // Sets automatically handle uniqueness.
                    const uniqueCharacterCollection = new Set();
                    // Iterate through the specified range, adjusting to 0-based indexing for the buffer.
                    for (let k = lowerBound - 1; k < upperBound; k++) {
                        // An additional safety check for robustness, though bounds should be handled by the 'if' above.
                        if (k < mutableCharBuffer.length) {
                            uniqueCharacterCollection.add(mutableCharBuffer[k]);
                        }
                    }
                    // The size of the Set directly provides the count of distinct characters.
                    const distinctCharResult = uniqueCharacterCollection.size;
                    emitOutput(distinctCharResult);
                } else {
                    // For invalid or empty ranges, output 0 as there are no distinct characters to count.
                    emitOutput(0);
                    // (Optional) Log a warning for an invalid range.
                }
                break;
            }

            default: {
                // This block handles any operation types not explicitly defined.
                // In a robust system, this might involve logging an error or skipping.
                break;
            }
        }
    }
}

// --- Program Entry Point ---
// This block handles reading input from the standard input stream and initiating processing.
// It's wrapped in a try-catch for basic error handling during file system operations.
try {
    const fileSystemModule = require('fs');
    const standardInputFilePath = '/dev/stdin';
    const inputEncoding = 'utf8';
    const entireInputContent = fileSystemModule.readFileSync(standardInputFilePath, inputEncoding);
    // Call the main processing function with the obtained input.
    processInputData(entireInputContent);
} catch (ioError) {
    // For competitive programming, this error handling is often omitted
    // as input is guaranteed to be valid and accessible.
    // console.error("An error occurred while reading input or during processing:", ioError);
}