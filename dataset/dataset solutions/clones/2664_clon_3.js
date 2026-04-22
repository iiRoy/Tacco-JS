const generateCanonicalForm = (charArrayInput) => {
    // Ensure the input is treated as an array of characters for sorting.
    // Using String() to handle potential non-string/non-array inputs gracefully.
    // The spread operator creates a shallow copy to prevent modifying the original array reference.
    const characterSequence = Array.isArray(charArrayInput) ? charArrayInput : String(charArrayInput).split('');
    return [...characterSequence].sort().join('');
};

/**
 * Processes a collection of string entries to identify and count specific patterns.
 * This function calculates the number of unique canonical string forms that appear
 * two or more times in the input data, replicating a specific counting bug from the original.
 *
 * @param {number} recordCount The total number of entries to process from the data collection.
 * @param {Array<Array<string>>} dataEntries An array of character arrays, where each inner array
 *                                            represents a string entry.
 * @returns {number} The sum of '1's for canonical forms encountered more than once.
 */
const processInputData = (recordCount, dataEntries) => {
    // Introduce a guard clause for initial input validation.
    // If the input is invalid or empty, return a default count of 0.
    if (!Number.isInteger(recordCount) || recordCount <= 0 || !Array.isArray(dataEntries) || dataEntries.length === 0) {
        console.warn("Warning: Invalid or empty input provided to processInputData. Returning 0.");
        return 0;
    }

    // A map to store the frequency-like aggregation based on the canonical form of each entry.
    // The values will reflect the peculiar counting logic of the original code (NaN for first, 1 for subsequent).
    const aggregatedFrequencies = {};

    // Iterate over the relevant portion of the input data entries.
    // Using forEach provides a clean loop structure without explicit index management.
    dataEntries.slice(0, recordCount).forEach((currentEntryItem) => {
        // Convert the current entry into its canonical string form (sorted characters).
        const canonicalFormIdentifier = generateCanonicalForm(currentEntryItem);

        // This conditional block explicitly replicates the original code's specific (and buggy) counting logic:
        // - If a `canonicalFormIdentifier` is encountered for the first time, its value in `aggregatedFrequencies`
        //   becomes `NaN` (because `undefined + undefined + 1` results in `NaN` in the original code's `else` branch).
        // - If a `canonicalFormIdentifier` is encountered a second or subsequent time, its value
        //   is reset/set to `1` (as per the original code's `if` branch).
        if (Object.prototype.hasOwnProperty.call(aggregatedFrequencies, canonicalFormIdentifier)) {
            // If the key already exists (meaning it was NaN from a first encounter, or 1 from previous encounters),
            // it is explicitly set to 1. This matches the original `count[tmp] = 1;` behavior.
            aggregatedFrequencies[canonicalFormIdentifier] = 1;
        } else {
            // If this is the very first time we've encountered this canonical form,
            // the original code's `count[tmp] += count[tmp] + 1;` (with `count[tmp]` being `undefined`)
            // evaluates to `undefined + undefined + 1`, which results in `NaN`. We replicate this directly.
            aggregatedFrequencies[canonicalFormIdentifier] = Number.NaN;
        }
    });

    // Retrieve all the aggregated values from our frequency map.
    const allFrequencyValues = Object.values(aggregatedFrequencies);

    // Filter these values to exclude `NaN`. According to the original logic, `NaN` values correspond
    // to canonical forms that were encountered exactly once. Values of `1` correspond to forms
    // encountered two or more times.
    const validNumericValues = allFrequencyValues.filter(
        (valueElement) => typeof valueElement === 'number' && !Number.isNaN(valueElement)
    );

    // If after filtering, no valid numeric values remain, the sum should be 0.
    if (validNumericValues.length === 0) {
        return 0;
    }

    // Sum the remaining valid numeric values. Since all remaining values will be `1` (due to the
    // specific counting bug), this sum effectively counts how many unique canonical forms appeared
    // two or more times.
    const finalComputedResult = validNumericValues.reduce((accumulatedSum, currentValue) => accumulatedSum + currentValue, 0);

    return finalComputedResult;
};

// --- Input Reading and Execution Section ---

// Access the Node.js 'fs' (file system) module for reading input.
const fileSystemOperations = require('fs');
const standardInputDevicePath = '/dev/stdin';
const textEncodingFormat = 'utf8';

let rawInputContentString;
try {
    // Attempt to synchronously read the entire content of the standard input file.
    rawInputContentString = fileSystemOperations.readFileSync(standardInputDevicePath, textEncodingFormat);
} catch (errorReadingFile) {
    // If an error occurs during file reading, log it and exit the process.
    console.error(`An error occurred while attempting to read from ${standardInputDevicePath}:`, errorReadingFile);
    process.exit(1); // Indicate an error exit.
}

// Split the raw input string by newline characters to get an array of individual lines.
const inputLineSegments = rawInputContentString.split("\n");

// The first line of input represents the total count of records to be processed.
const numberOfRecordsToProcess = Number(inputLineSegments[0]);

// The subsequent lines form the data collection. Each line is converted into an array of its characters.
const processedDataCollection = inputLineSegments.slice(1).map(singleLineText => {
    // Ensure each line is treated as a string before splitting it into individual characters.
    return String(singleLineText).split('');
});

// Execute the primary logic function with the parsed input and print the final result to the console.
console.log(processInputData(numberOfRecordsToProcess, processedDataCollection));