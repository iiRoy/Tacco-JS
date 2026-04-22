const SCRIPT_INPUT_SOURCE_PATH = '/dev/stdin';
const TEXT_ENCODING_FORMAT = 'utf8';

/**
 * Parses a string line containing space-separated numbers into an array of integers.
 * Includes robustness for multiple spaces and non-numeric entries.
 *
 * @param {string} lineString The input string line to parse.
 * @returns {number[]} An array of numbers successfully parsed from the line.
 */
function extractNumericValues(lineString) {
    // Validate input type and handle empty strings gracefully.
    if (typeof lineString !== 'string' || lineString.trim().length === 0) {
        console.warn("Input line for numeric extraction was empty or invalid. Returning an empty array.");
        return [];
    }

    // Split by one or more whitespace characters, then filter out any empty strings
    // that might result from leading/trailing/multiple spaces.
    const stringTokens = lineString.split(/\s+/).filter(Boolean);

    const parsedNumbers = [];
    for (const token of stringTokens) {
        const numericValue = Number(token); // Use Number constructor for conversion
        if (Number.isFinite(numericValue)) { // Check if it's a valid finite number
            parsedNumbers.push(numericValue);
        } else {
            // Log a warning for values that couldn't be converted to a valid number.
            console.info(`Skipping non-numeric or infinite value encountered: "${token}"`);
        }
    }
    return parsedNumbers;
}

// Main execution wrapper to encapsulate variables and logic.
(function processDataAndDetermineOverlap() {
    let rawFileContents;
    try {
        // Attempt to read the entire file content synchronously.
        rawFileContents = require('fs').readFileSync(SCRIPT_INPUT_SOURCE_PATH, TEXT_ENCODING_FORMAT);
    } catch (readOperationError) {
        console.error(`Fatal Error: Could not retrieve input from ${SCRIPT_INPUT_SOURCE_PATH}. Reason: ${readOperationError.message}`);
        // Terminate execution as input is critical.
        process.exit(1);
    }

    // Split the raw content into individual lines.
    // Using .trim() on the full content before splitting to handle potential
    // leading/trailing newlines in the file itself.
    const allInputTextLines = rawFileContents.trim().split('\n');

    // Define symbolic constants for specific line indices to improve code clarity.
    const PRIMARY_NUMBERS_LINE_INDEX = 1;
    const SECONDARY_NUMBERS_LINE_INDEX = 3;

    // Implement a basic guard clause to ensure expected input structure.
    if (allInputTextLines.length <= SECONDARY_NUMBERS_LINE_INDEX) {
        console.error(`Error: Expected at least ${SECONDARY_NUMBERS_LINE_INDEX + 1} lines of input, but received only ${allInputTextLines.length}. Aborting.`);
        process.exit(1);
    }

    // Extract and parse the primary set of numbers.
    // Converting to a Set provides O(1) average time complexity for lookups,
    // which is more efficient than O(N) for array indexOf for large datasets.
    const referenceNumberCollection = new Set(extractNumericValues(allInputTextLines[PRIMARY_NUMBERS_LINE_INDEX]));

    // Extract and parse the secondary list of numbers to check against the reference.
    const numbersToVerify = extractNumericValues(allInputTextLines[SECONDARY_NUMBERS_LINE_INDEX]);

    // Initialize a counter for common elements.
    let totalOverlapOccurrences = 0;

    // Iterate through each number in the secondary list.
    // Using a 'for...of' loop for modern iteration.
    for (const currentNumericItem of numbersToVerify) {
        // Check if the current item exists within the reference collection.
        if (referenceNumberCollection.has(currentNumericItem)) {
            totalOverlapOccurrences++;
        }
    }

    // Output the final count of matching elements.
    // Using process.stdout.write for direct stream output, similar to console.log but without automatic newline.
    process.stdout.write(totalOverlapOccurrences.toString() + '\n');
})();