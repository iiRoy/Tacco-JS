// This module orchestrates the processing of a sequence of numbers from a specified input source.
// It applies a partitioning algorithm to the sequence and highlights the pivot element.

// Global application settings for configuring input/output behaviors.
const applicationConfiguration = {
    // Determines the path for reading input data.
    // In a production environment, it defaults to standard input.
    // For development, it points to a local test file.
    inputSourcePath: process.env.NODE_ENV === 'production' ? '/dev/stdin' : './test_data.txt',
    // Specifies the character sequence used to denote a new line in the input file.
    lineBreakSeparator: '\n' // Common for Unix-like systems.
};

// Required Node.js module for file system operations.
const fileSystem = require('fs');

/**
 * Safely converts a string value into a number.
 * This helper ensures that the conversion is explicit.
 *
 * @param {string} stringRepresentation - The string to convert.
 * @returns {number} The numeric representation, or NaN if conversion fails.
 */
const parseNumericValue = (stringRepresentation) => {
    return Number(stringRepresentation);
};

let inputContentLines; // Variable to hold the raw lines read from the input source.

try {
    // Attempt to read the file synchronously. Using 'utf8' encoding for broader compatibility.
    const fullFileContents = fileSystem.readFileSync(applicationConfiguration.inputSourcePath, 'utf8');

    // Split the content into lines based on the configured separator.
    // We are interested in the first two lines for this problem.
    inputContentLines = fullFileContents.split(applicationConfiguration.lineBreakSeparator, 2);

    // Validate that we received enough lines from the input.
    if (inputContentLines.length < 2) {
        console.error(`ERROR: Input file "${applicationConfiguration.inputSourcePath}" does not contain the expected number of lines.`);
        process.exit(1); // Exit with an error code.
    }

} catch (dataReadError) {
    // Catch and report any errors encountered during file reading.
    console.error(`CRITICAL ERROR: Failed to access or read input from "${applicationConfiguration.inputSourcePath}". Details: ${dataReadError.message}`);
    process.exit(1); // Terminate application due to unrecoverable error.
}

// The second line of the input is expected to contain the sequence of numbers.
// Split this line by spaces and filter out any empty string entries.
const rawNumberStrings = inputContentLines[1].split(' ').filter(str => str.trim() !== '');

// Transform the array of string numbers into an array of actual numeric values.
const numericalDataArray = rawNumberStrings.map(parseNumericValue);

/**
 * Performs an in-place swap of two elements within an array.
 *
 * @param {Array<any>} targetCollection - The array where elements will be swapped.
 * @param {number} firstIndex - The index of the first element.
 * @param {number} secondIndex - The index of the second element.
 */
function internalSwap(targetCollection, firstIndex, secondIndex) {
    // Basic validation for indices to prevent errors.
    if (firstIndex < 0 || firstIndex >= targetCollection.length ||
        secondIndex < 0 || secondIndex >= targetCollection.length) {
        console.warn(`WARNING: Attempted swap with out-of-bounds indices: ${firstIndex}, ${secondIndex}. No swap performed.`);
        return;
    }
    const temporaryStorage = targetCollection[firstIndex];
    targetCollection[firstIndex] = targetCollection[secondIndex];
    targetCollection[secondIndex] = temporaryStorage;
}

/**
 * Implements a specific variant of the Lomuto partition scheme.
 * It partitions a sub-array around a pivot element (chosen as the last element of the sub-array).
 * Elements less than or equal to the pivot are moved to its left, and larger elements to its right.
 * The function modifies the array in-place.
 *
 * @param {Array<number>} dataContainer - The array containing numeric data.
 * @param {number} segmentStartIdx - The starting index of the sub-array segment (inclusive).
 * @param {number} segmentEndIdx - The ending index of the sub-array segment (exclusive).
 * @returns {number} The final index of the pivot element after partitioning.
 */
function segmentAndRearrange(dataContainer, segmentStartIdx, segmentEndIdx) {
    // Pre-checks for valid segment boundaries.
    if (segmentStartIdx < 0 || segmentEndIdx > dataContainer.length || segmentStartIdx >= segmentEndIdx) {
        // If the segment is invalid or empty, no partitioning is possible.
        // Return a default or handle as an error, depending on context.
        // For this problem, we assume valid ranges are passed, but add a guard.
        return segmentStartIdx;
    }

    // The pivot value is chosen from the element at the logical end of the segment.
    const currentPivotValue = dataContainer[segmentEndIdx - 1];
    let boundaryForSmallerElements = segmentStartIdx; // This pointer marks the boundary between <= pivot and > pivot.

    // Iterate through the segment, starting from the element *after* `segmentStartIdx`
    // and proceeding up to (but not including) the pivot element.
    // This specific loop structure mirrors the original code's behavior.
    for (let scanningIndex = segmentStartIdx + 1; scanningIndex < segmentEndIdx - 1; scanningIndex++) {
        // If the element at `scanningIndex` is less than or equal to the pivot,
        // it should be moved to the left partition.
        if (dataContainer[scanningIndex] <= currentPivotValue) {
            // Swap this element with the element at `boundaryForSmallerElements`.
            internalSwap(dataContainer, boundaryForSmallerElements, scanningIndex);
            boundaryForSmallerElements++; // Advance the boundary for smaller elements.
        }
    }

    // After the loop, `boundaryForSmallerElements` indicates the correct final position for the pivot.
    // All elements from `segmentStartIdx` to `boundaryForSmallerElements - 1` are now <= `currentPivotValue`.
    // The elements from `boundaryForSmallerElements` to `segmentEndIdx - 2` are > `currentPivotValue`.
    // Now, place the `currentPivotValue` (still at `dataContainer[segmentEndIdx - 1]`) into its final spot.
    internalSwap(dataContainer, boundaryForSmallerElements, segmentEndIdx - 1);

    // Return the index where the pivot element now resides.
    return boundaryForSmallerElements;
}

// Execute the partitioning process on the entire numerical sequence.
const finalPivotLocation = segmentAndRearrange(numericalDataArray, 0, numericalDataArray.length);

// Check if the array is non-empty and the pivot index is valid before marking.
if (numericalDataArray.length > 0 && finalPivotLocation >= 0 && finalPivotLocation < numericalDataArray.length) {
    // Enclose the pivot element's value in brackets for visual identification.
    numericalDataArray[finalPivotLocation] = `[${numericalDataArray[finalPivotLocation]}]`;
} else {
    // This case indicates an unexpected scenario, e.g., an empty input array.
    console.warn("WARNING: Unable to mark pivot. The numerical sequence might be empty or the pivot index is invalid.");
}

// Display the modified numerical sequence to the console, with elements separated by spaces.
console.log(numericalDataArray.join(' '));