// Expert-generated Type III Code Clone
// This code processes structured input from stdin, performing string substitutions based on provided mappings.
// It applies extensive modifications including identifier renaming, data structure changes,
// addition of helper functions, robust parsing, and enhanced error handling, while preserving core functionality.

// Utilize the Node.js 'fs' module to synchronously read the entire standard input.
const standardInputRawData = require('fs').readFileSync('/dev/stdin', 'utf8');

/**
 * Parses a string value into a non-negative integer.
 * Includes trimming, NaN check, and negative number check, returning a default value if invalid.
 * @param {string} inputString The string to parse.
 * @param {number} [fallbackValue=0] The value to return if parsing fails or number is negative.
 * @returns {number} The parsed non-negative integer or the fallback value.
 */
const obtainValidPositiveInteger = (inputString, fallbackValue = 0) => {
    // Remove leading/trailing whitespace and attempt to parse as a base-10 integer.
    const numericValue = Number.parseInt(inputString.trim(), 10);
    // Return the parsed value if it's a valid, non-negative number; otherwise, return the fallback.
    return (Number.isNaN(numericValue) || numericValue < 0) ? fallbackValue : numericValue;
};

// Prepare the input for sequential processing.
// Trim overall whitespace and split the input into an array of individual lines.
let dataProcessingQueue = standardInputRawData.trim().split('\n');

// The main application loop continues as long as there are lines remaining in the queue.
// It processes blocks of data until a specific termination signal (a '0' as a block size) is encountered.
while (dataProcessingQueue.length > 0) {
    // Extract the line indicating the number of key-value mapping pairs for the current block.
    const mappingCountLine = dataProcessingQueue.shift();

    // If no line is available, it signifies an unexpected end of input, so terminate.
    if (!mappingCountLine) {
        console.error("Critical Error: Unexpected end of input while expecting mapping count.");
        break;
    }

    // Parse the mapping count, using our robust parsing function.
    const currentMappingPairsCount = obtainValidPositiveInteger(mappingCountLine);

    // A mapping count of zero serves as the termination signal for the entire input processing.
    if (currentMappingPairsCount === 0) {
        // Explicitly break the main loop when the termination condition is met.
        break;
    }

    // Initialize a new Map data structure to store the key-value substitutions for this block.
    // Map is preferred over a plain object for better key handling (e.g., non-string keys, avoiding prototype conflicts).
    const translationDictionary = new Map();

    // Verify if there are sufficient lines in the queue to fulfill the declared mapping count.
    if (dataProcessingQueue.length < currentMappingPairsCount) {
        console.error(`Input Error: Declared mapping count (${currentMappingPairsCount}) exceeds available lines.`);
        break; // Malformed input, cannot proceed reliably.
    }

    // Iterate to populate the translation dictionary with the specified number of mapping pairs.
    for (let mapEntryIndex = 0; mapEntryIndex < currentMappingPairsCount; ++mapEntryIndex) {
        const currentMappingLine = dataProcessingQueue.shift(); // Get the next key-value pair line.
        // Defensive check against unexpected empty lines in the middle of a block.
        if (!currentMappingLine) {
            console.error("Input Error: Missing mapping line where one was expected.");
            break; // Break current block processing.
        }
        // Split the line into its key and value components, ensuring whitespace is handled.
        const keyAndValueParts = currentMappingLine.trim().split(' ');

        // Validate that the line contains at least a key and a value.
        if (keyAndValueParts.length >= 2) {
            translationDictionary.set(keyAndValueParts[0], keyAndValueParts[1]);
        } else {
            // Log a warning for malformed mapping lines and skip them.
            console.warn(`Warning: Skipping malformed mapping line: "${currentMappingLine}". Expected "key value".`);
        }
    }

    // Extract the line indicating the number of lookup keys for the current block.
    const lookupCountLine = dataProcessingQueue.shift();

    // If no line is available, it's an error.
    if (!lookupCountLine) {
        console.error("Critical Error: Unexpected end of input while expecting lookup count.");
        break;
    }

    // Parse the lookup count.
    const currentLookupKeysCount = obtainValidPositiveInteger(lookupCountLine);

    // A string builder to accumulate the results for the current block.
    let blockOutputAccumulator = '';

    // Verify if there are sufficient lines in the queue for the declared lookup count.
    if (dataProcessingQueue.length < currentLookupKeysCount) {
        console.error(`Input Error: Declared lookup count (${currentLookupKeysCount}) exceeds available lines.`);
        break; // Malformed input, cannot proceed reliably.
    }

    // Iterate through the specified number of lookup keys, performing substitutions.
    for (let lookupEntryIndex = 0; lookupEntryIndex < currentLookupKeysCount; ++lookupEntryIndex) {
        const keyToLookup = dataProcessingQueue.shift(); // Get the next key to process.
        // Defensive check against unexpected empty lines.
        if (!keyToLookup) {
            console.error("Input Error: Missing lookup key where one was expected.");
            break; // Break current block processing.
        }
        const cleanedLookupKey = keyToLookup.trim(); // Ensure no leading/trailing whitespace affects the lookup.

        // Check if the cleaned key exists in our translation dictionary.
        if (translationDictionary.has(cleanedLookupKey)) {
            // If found, append its corresponding value to the output.
            blockOutputAccumulator += translationDictionary.get(cleanedLookupKey);
        } else {
            // If not found, append the original (cleaned) key itself.
            blockOutputAccumulator += cleanedLookupKey;
        }
    }

    // Print the final accumulated string for the current processing block to standard output.
    console.log(blockOutputAccumulator);

    // The loop will then proceed to the next iteration, attempting to read the size of the subsequent mapping block.
    // This implicit handling replaces the explicit `Arr.slice()` operations of the original code,
    // as `shift()` directly modifies the `dataProcessingQueue` array.
}