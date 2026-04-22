const operatingSystemIOLibrary = require('fs');

// Configuration constants for input source and parsing.
const SYSTEM_INPUT_PATH = '/dev/stdin';
const LINE_BREAK_DELIMITER = '\n';
const FIELD_SEPARATOR = ' ';

/**
 * Safely retrieves raw string data from a specified file path.
 * Includes basic error handling for file access issues.
 * @param {string} sourceFilePath The path to the input file.
 * @returns {string} The content of the file, or an empty string if an error occurs.
 */
const fetchSourceData = (sourceFilePath) => {
    try {
        // Synchronously read the entire file content, assuming UTF-8 encoding.
        return operatingSystemIOLibrary.readFileSync(sourceFilePath, 'utf8');
    } catch (ioError) {
        // Output an error message to standard error stream if reading fails.
        process.stderr.write(`Error accessing input source "${sourceFilePath}": ${ioError.message}\n`);
        return ''; // Return an empty string to allow the program to continue gracefully.
    }
};

/**
 * Displays a formatted result line to the standard output.
 * @param {string} identifier The key string to display.
 * @param {number} count The numeric value associated with the key.
 */
const emitFormattedResult = (identifier, count) => {
    // Use process.stdout.write for direct output, appending a newline character.
    process.stdout.write(`${identifier} ${count}\n`);
};

// Main execution logic encapsulated within an Immediately Invoked Function Expression (IIFE).
// This prevents global variable pollution and defines a clear execution scope.
(() => {
    // Step 1: Data Acquisition and Initial Input Parsing
    // Fetch the raw string content from the designated system input path.
    const rawInputContent = fetchSourceData(SYSTEM_INPUT_PATH);

    // If no content is obtained, output a message and terminate execution for this run.
    if (!rawInputContent) {
        process.stderr.write("No raw input content received. Terminating processing.\n");
        return;
    }

    // Normalize input: remove leading/trailing whitespace and split into an array of lines.
    let processedInputLines = rawInputContent.trim().split(LINE_BREAK_DELIMITER);

    // Validate that there is at least one line after initial processing.
    if (processedInputLines.length === 0 || processedInputLines[0].length === 0) {
        process.stderr.write("Input stream appears empty or contains only whitespace after initial parsing.\n");
        return;
    }

    // Extract the very first line, which is expected to contain the count of subsequent data entries.
    const expectedDataEntryCountString = processedInputLines.shift();
    const expectedDataEntryCount = parseInt(expectedDataEntryCountString, 10);

    // Perform validation on the parsed entry count.
    if (isNaN(expectedDataEntryCount) || expectedDataEntryCount < 0) {
        process.stderr.write(`Invalid or non-positive data entry count provided: "${expectedDataEntryCountString}". Cannot proceed.\n`);
        return;
    }

    // Initialize an object to serve as a frequency map or registry for items.
    const itemFrequencyRegistry = {}; // This replaces the original 'hash' variable.

    // Step 2: Iterate through Data Entries and Populate the Frequency Registry
    // Iterate only for the number of expected data entries, or until lines run out.
    for (let currentLineIndex = 0; currentLineIndex < expectedDataEntryCount; currentLineIndex++) {
        // Ensure the current line index is within the bounds of available lines.
        if (currentLineIndex >= processedInputLines.length) {
            process.stderr.write(`Warning: Expected ${expectedDataEntryCount} data entries but only found ${currentLineIndex}. Processing stopped prematurely.\n`);
            break; // Exit the loop if we run out of lines prematurely.
        }

        const singleDataLine = processedInputLines[currentLineIndex];
        // Skip lines that are empty or contain only whitespace after trimming.
        if (!singleDataLine.trim()) {
            continue;
        }

        // Split the current data line into its constituent parts (key and value).
        const lineParts = singleDataLine.split(FIELD_SEPARATOR);

        // Validate that the line contains at least two parts (a key and a value).
        if (lineParts.length < 2) {
            process.stderr.write(`Warning: Malformed data line encountered "${singleDataLine}". This entry will be skipped.\n`);
            continue;
        }

        const keyIdentifier = lineParts[0]; // The first part is the key.
        const rawValueComponent = lineParts[1]; // The second part is the raw value string.

        // Explicitly convert the raw value component to a number.
        const numericQuantity = Number(rawValueComponent);

        // Validate that the converted numeric quantity is indeed a valid number.
        if (isNaN(numericQuantity)) {
            process.stderr.write(`Warning: Non-numeric value "${rawValueComponent}" found for key "${keyIdentifier}". This entry will be skipped.\n`);
            continue;
        }

        // Accumulate the numeric quantity for the respective key.
        // If the key does not yet exist in the registry, initialize its count to 0 before adding.
        itemFrequencyRegistry[keyIdentifier] = (itemFrequencyRegistry[keyIdentifier] || 0) + numericQuantity;
    }

    // Step 3: Prepare and Sort Keys for Final Output
    // Extract all unique keys from the populated frequency registry.
    let uniqueKeysCollection = Object.keys(itemFrequencyRegistry); // This replaces the 'X' array.

    // Apply a custom sorting algorithm to the keys.
    // The primary sorting criterion is the length of the key string (ascending).
    // The secondary sorting criterion (for keys of equal length) is alphabetical order (ascending).
    uniqueKeysCollection.sort((firstKey, secondKey) => {
        const lengthComparisonResult = firstKey.length - secondKey.length;
        // If lengths are different, use the length difference for sorting.
        if (lengthComparisonResult !== 0) {
            return lengthComparisonResult;
        }
        // If lengths are identical, perform a lexicographical (alphabetical) comparison.
        return firstKey.localeCompare(secondKey);
    });

    // Step 4: Output the Final Sorted Results
    // Iterate through the array of finally sorted keys.
    for (const finalKeyIdentifier of uniqueKeysCollection) { // Using 'for...of' for clean array iteration.
        // Retrieve the accumulated count for the current key from the frequency registry.
        const associatedCount = itemFrequencyRegistry[finalKeyIdentifier];
        // Emit the key and its count using the helper function.
        emitFormattedResult(finalKeyIdentifier, associatedCount);
    }
})();