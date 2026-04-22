const fileSystemModule = require('fs'); // Import the Node.js file system module.

// Define the path to the standard input file.
const standardInputPath = '/dev/stdin';

// Define the set of recognized status codes for processing.
const recognizedStatusCodes = Object.freeze(['AC', 'WA', 'TLE', 'RE']);

/**
 * Reads content from a specified file path and processes it.
 * @param {string} filePath - The path to the file to read.
 * @returns {string[]} An array of non-empty, trimmed lines from the file.
 */
function acquireInputData(filePath) {
    try {
        // Read the entire file content as a UTF-8 string.
        const rawContentBuffer = fileSystemModule.readFileSync(filePath, 'utf8');

        // Split the content by newline characters, filter out empty lines, and trim whitespace.
        const processedLines = rawContentBuffer
            .split(/\r?\n/) // Handle both Windows and Unix newlines
            .map(line => line.trim()) // Remove leading/trailing whitespace from each line
            .filter(line => line.length > 0); // Exclude entirely empty lines

        return processedLines;
    } catch (inputError) {
        console.error(`Error encountered during input acquisition: ${inputError.message}`);
        // Return an empty array to prevent further processing with invalid data.
        return [];
    }
}

/**
 * Aggregates the counts of each status code found in the input lines.
 * @param {string[]} dataLines - An array of strings, each representing a status code.
 * @returns {Map<string, number>} A Map where keys are status codes and values are their counts.
 */
function tallyStatusCodeOccurrences(dataLines) {
    // Initialize a Map to store the counts of each status code.
    const codeTally = new Map();

    // Iterate over each line provided in the input data.
    dataLines.forEach(currentCodeEntry => {
        // Only process codes that are within our recognized list.
        // This acts as a basic validation/filtering step.
        if (recognizedStatusCodes.includes(currentCodeEntry)) {
            // Retrieve the current count for this code, defaulting to 0 if not yet present.
            const existingCount = codeTally.get(currentCodeEntry) || 0;
            // Increment the count and update the Map.
            codeTally.set(currentCodeEntry, existingCount + 1);
        } else {
            // Optionally log unknown codes for debugging or reporting.
            // console.warn(`Unrecognized status code encountered: '${currentCodeEntry}'`);
        }
    });

    return codeTally;
}

/**
 * Formats a single status code and its count into a display string.
 * @param {string} codeIdentifier - The status code (e.g., 'AC', 'WA').
 * @param {number} totalCount - The number of occurrences for the code.
 * @returns {string} The formatted output string.
 */
function generateOutputDisplay(codeIdentifier, totalCount) {
    // Ensure the count is treated as a number, defaulting to 0 if it's not valid.
    const actualCount = Number.isInteger(totalCount) ? totalCount : 0;
    return `${codeIdentifier} x ${actualCount}`;
}

// --- Main execution flow ---

// Read all input lines from the standard input.
const collectedInputLines = acquireInputData(standardInputPath);

// Perform a quick check if input was successfully collected.
if (collectedInputLines.length === 0) {
    console.error("No valid input lines were processed. Exiting.");
    process.exit(1); // Indicate an error state
}

// Calculate the frequency of each status code.
const statusFrequencyMap = tallyStatusCodeOccurrences(collectedInputLines);

// Iterate through the predefined list of recognized status codes.
recognizedStatusCodes.forEach(targetCode => {
    // Get the count for the current target code from the frequency map.
    // If a code was not present in the input, its count will be undefined, so default to 0.
    const finalCount = statusFrequencyMap.get(targetCode) || 0;

    // Format the result for display and print it to the console.
    const formattedOutputLine = generateOutputDisplay(targetCode, finalCount);
    console.log(formattedOutputLine);
});