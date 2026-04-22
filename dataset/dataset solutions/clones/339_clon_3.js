const filesystemAccess = require('fs');

// Constant defining the standard input file path on Unix-like systems.
const DEFAULT_INPUT_SOURCE = '/dev/stdin';

/**
 * Safely retrieves content from a specified file path.
 * Includes basic error handling to prevent application crashes.
 * @param {string} sourcePath - The full path to the input file.
 * @returns {string} The entire content of the file as a UTF-8 string, or an empty string if an error occurs.
 */
function retrieveFileContent(sourcePath) {
    try {
        // Synchronously read the file, assuming UTF-8 encoding.
        return filesystemAccess.readFileSync(sourcePath, 'utf8');
    } catch (readOperationError) {
        // Log the error for debugging purposes and return an empty string.
        console.error(`An error occurred while accessing the input file at ${sourcePath}:`, readOperationError.message);
        return '';
    }
}

/**
 * Transforms an array of string representations of numbers into a sorted,
 * space-separated string of actual numbers. Non-numeric entries are filtered out.
 * @param {string[]} stringNumberArray - An array where each element is expected to be a string representation of a number.
 * @returns {string} A string containing numerically sorted, space-separated numbers.
 */
const processAndSortNumericSequence = (stringNumberArray) => {
    // Convert each string element to a number, trimming whitespace first for robustness.
    // Filter out any results that are not valid numbers (NaN).
    const parsedNumbers = stringNumberArray
        .map(item => Number(item.trim()))
        .filter(value => !isNaN(value));

    // Sort the array of numbers in ascending order.
    parsedNumbers.sort((numA, numB) => numA - numB);

    // Join the sorted numbers back into a single string, separated by spaces.
    return parsedNumbers.join(' ');
};

// --- Core Application Logic ---

// 1. Acquire the raw text data from the predefined input source.
const rawSourceText = retrieveFileContent(DEFAULT_INPUT_SOURCE);

// Early exit if no meaningful input is obtained.
if (!rawSourceText.trim()) {
    // console.log("No input data was provided or it was entirely whitespace. Terminating.");
    process.exit(0);
}

// 2. Normalize the input text: trim overall whitespace, split into individual lines,
//    and filter out any lines that are empty after trimming.
const processedInputLines = rawSourceText
    .trim()
    .split('\n')
    .filter(singleLine => singleLine.trim().length > 0);

// Early exit if all lines were empty after filtering.
if (processedInputLines.length === 0) {
    // console.log("Input consisted only of empty lines. Terminating.");
    process.exit(0);
}

// 3. Populate a Map data structure where keys are identifiers and values are
//    arrays of associated numeric strings.
const valueCollectionsByIdentifier = new Map();

for (const currentInputLine of processedInputLines) {
    // Split each line into its constituent parts, typically an identifier and a value.
    const lineComponents = currentInputLine.split(' ');

    // Implement a basic guard clause for malformed lines.
    if (lineComponents.length < 2) {
        // console.warn(`Skipping line due to insufficient components: "${currentInputLine}"`);
        continue; // Proceed to the next line.
    }

    const keyIdentifier = lineComponents[0].trim(); // The first component is the primary key.
    const dataValueString = lineComponents[1].trim(); // The second component is the associated value.

    // Ensure the key itself is not empty.
    if (!keyIdentifier) {
        // console.warn(`Skipping line with an empty identifier: "${currentInputLine}"`);
        continue;
    }

    // Initialize an empty array for the key if it doesn't exist yet in the map.
    if (!valueCollectionsByIdentifier.has(keyIdentifier)) {
        valueCollectionsByIdentifier.set(keyIdentifier, []);
    }
    // Append the current data value string to the array associated with its key.
    valueCollectionsByIdentifier.get(keyIdentifier).push(dataValueString);
}

// Early exit if no valid identifier-value pairs were collected.
if (valueCollectionsByIdentifier.size === 0) {
    // console.log("No valid data entries were collected for processing. Terminating.");
    process.exit(0);
}

// 4. Transform the collected value arrays into sorted numeric strings.
//    A new Map stores the final, processed data.
const finalFormattedDataMap = new Map();

// Iterate through each identifier and its collection of raw string values.
for (const [idKey, rawValueStrings] of valueCollectionsByIdentifier.entries()) {
    // Apply the helper function to sort and format the numeric strings.
    const sortedFormattedValues = processAndSortNumericSequence(rawValueStrings);
    finalFormattedDataMap.set(idKey, sortedFormattedValues);
}

// 5. Extract all unique identifiers and sort them alphabetically.
let orderedOutputKeys = Array.from(finalFormattedDataMap.keys());
orderedOutputKeys.sort(); // Lexicographical sort is the default.

// 6. Iterate through the sorted identifiers and print the final output.
//    Each output block contains an identifier, a newline, and its sorted, formatted values.
for (const currentOutputId of orderedOutputKeys) {
    const outputValues = finalFormattedDataMap.get(currentOutputId);
    console.log(`${currentOutputId}\n${outputValues}`);
}

// Program execution concludes.