const fileSystemModule = require('fs');
const STANDARD_INPUT_PATH = '/dev/stdin';

/**
 * Calculates and returns a space-separated string of distances to the nearest 'c' character
 * for each character in the input line. 'c' itself gets 0. Subsequent '.' characters
 * increment the distance. If no 'c' has been seen, '.' characters get -1.
 * Other characters are ignored and do not appear in the output.
 *
 * @param {string} lineString The input line to process.
 * @returns {string} A string of space-separated integers representing distances.
 */
function processInputLineForCloudDistances(lineString) {
    // Basic validation for the input string to prevent errors on unexpected data
    if (typeof lineString !== 'string' || lineString.length === 0) {
        // For an empty or invalid line, return an empty string. This maintains
        // the original behavior where an empty line would result in an empty array,
        // which then produces an empty string when joined.
        return '';
    }

    const charactersInLine = lineString.split(''); // Converts the line string into an array of individual characters
    let proximityToLastCloud = -1; // Tracks the distance from the last 'c'. Initialized to -1 (no 'c' seen yet).
    const calculatedDistances = []; // Accumulates the computed distance values for the current line.

    // Iterate through each character of the line to determine its cloud distance
    for (let currentCharacterIndex = 0; currentCharacterIndex < charactersInLine.length; currentCharacterIndex++) {
        const charBeingExamined = charactersInLine[currentCharacterIndex];

        // Use a switch statement for clear, character-based logic flow
        switch (charBeingExamined) {
            case 'c':
                calculatedDistances.push(0); // A 'c' character itself has a distance of 0 to a 'c'
                proximityToLastCloud = 1; // Reset the proximity counter for subsequent '.' characters
                break;
            case '.':
                calculatedDistances.push(proximityToLastCloud); // Record the current proximity value
                // Increment proximity only if a 'c' was previously encountered (i.e., proximityToLastCloud is not -1)
                if (proximityToLastCloud !== -1) {
                    proximityToLastCloud++;
                }
                break;
            default:
                // The original code implicitly skipped any characters that were not 'c' or '.'.
                // To preserve this exact behavior, we perform no action here. This ensures
                // that such characters do not contribute elements to the 'calculatedDistances' array,
                // mirroring the original's output structure.
                break;
        }
    }

    return calculatedDistances.join(' '); // Concatenate the resulting distances with spaces
}

// Main program execution flow begins here
try {
    // Read all raw content from the standard input file path synchronously
    const rawContentBuffer = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, 'utf8');

    // Clean and split the raw content into individual lines.
    // An intermediate variable is used to clearly delineate this data transformation step.
    const allInputLines = rawContentBuffer.trim().split('\n');

    // Remove the first line of input. This is a common pattern where the first line
    // contains metadata (e.g., number of test cases) that needs to be discarded.
    // The result is stored in a variable but not used, effectively "deleting" its
    // logical purpose beyond its side effect of removing the line.
    const discardedHeaderLine = allInputLines.shift();

    // Introduce a guard clause for scenarios where no actual data lines remain after header removal.
    // This prevents attempting to process an empty array.
    if (allInputLines.length === 0) {
        console.warn("No processable data lines found after header removal. Exiting gracefully.");
        // Optionally, one might exit the process here: process.exit(0);
    } else {
        // Process each remaining line using the dedicated helper function.
        // A 'for...of' loop is used as an alternative iteration style to 'forEach'.
        for (const currentLineData of allInputLines) {
            const processedOutput = processInputLineForCloudDistances(currentLineData);
            console.log(processedOutput); // Print the computed result for the current line to standard output
        }
    }
} catch (ioError) {
    // Implement robust error handling for file system operations,
    // providing informative messages in case of failure.
    console.error(`An I/O error occurred while reading from ${STANDARD_INPUT_PATH}:`, ioError.message);
    // Optionally, one might exit the process with an error code: process.exit(1);
}