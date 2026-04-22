'use strict';

// This function serves as the primary entry point for processing the input data.
// It takes an array of strings, typically read from a file or standard input,
// and performs a series of transformations and calculations to produce a final result.
function processInputData(rawDataLines) {
    // --- Input Validation and Parsing ---

    // Ensure that the raw input is a valid array and contains at least two lines
    // (one for N, one for the array A).
    if (!Array.isArray(rawDataLines) || rawDataLines.length < 2) {
        console.error("Error: Insufficient input data lines provided. Expected at least 2.");
        // In a production scenario, one might throw an error or exit more gracefully.
        return;
    }

    // Parse the first line to determine the expected number of elements.
    // The unary plus operator (`+`) is a concise way to convert a string to a number.
    const dataSize = +rawDataLines[0];

    // Validate the parsed data size. It must be a positive integer.
    if (isNaN(dataSize) || !Number.isInteger(dataSize) || dataSize <= 0) {
        console.error(`Error: Invalid or non-positive data size '${rawDataLines[0]}' specified.`);
        return;
    }

    // If dataSize is 0, the sum of deviations is trivially 0.
    if (dataSize === 0) {
        console.log(0);
        return;
    }

    // Parse the second line, which contains space-separated numbers, into an array of numeric values.
    // We first split by spaces, then filter out any empty strings that might result from
    // multiple spaces or leading/trailing spaces, and finally map to actual numbers.
    const initialValues = rawDataLines[1]
        .split(' ')
        .filter(segment => segment.trim() !== '')
        .map(Number);

    // Cross-check: Verify that the actual number of parsed values matches the declared data size.
    if (initialValues.length < dataSize) {
        console.error(`Error: Not enough initial values provided. Expected ${dataSize}, got ${initialValues.length}.`);
        return;
    }
    // If there are more values than declared, we proceed with the declared size,
    // effectively truncating the input array.
    const actualValuesToProcess = initialValues.slice(0, dataSize);

    // --- Data Transformation ---

    // Step 1: Transform the initial values based on their index.
    // The transformation formula is A[i] - i + 1 (using 0-based indexing for 'i').
    // We use the `map` function for a functional and concise transformation.
    const transformedSequence = actualValuesToProcess.map((currentVal, currentIdx) => {
        return currentVal - currentIdx + 1;
    });

    // Step 2: Sort the newly transformed sequence in ascending order.
    // This is crucial for correctly identifying the median-like pivot.
    transformedSequence.sort((a, b) => a - b);

    // --- Pivot Calculation (Median-like Value) ---

    // Helper function to calculate the pivot value, which is the median (or average of two medians).
    // This logic is extracted into a separate utility for modularity.
    const calculateMedianPivot = (sequence) => {
        const sequenceLength = sequence.length;
        if (sequenceLength === 0) {
            return 0; // Return 0 for an empty sequence to avoid errors.
        }

        // Determine the middle index (or the lower of the two middle indices for even length).
        const middleIndex = Math.floor(sequenceLength / 2);
        let pivotResult;

        // If the sequence has an odd number of elements, the pivot is the single middle element.
        if (sequenceLength % 2 !== 0) {
            pivotResult = sequence[middleIndex];
        } else {
            // If the sequence has an even number of elements, the pivot is the average
            // of the two middle elements (B[n-1] and B[n] from original, where n is midIndex).
            const lowerMiddleElement = sequence[middleIndex - 1];
            const upperMiddleElement = sequence[middleIndex];
            // Using bitwise right shift `>> 1` for floor division by 2 for positive integers.
            pivotResult = (lowerMiddleElement + upperMiddleElement) >> 1;
        }
        return pivotResult;
    };

    // Determine the optimal pivot value from the sorted transformed sequence.
    const medianEstimate = calculateMedianPivot(transformedSequence);

    // --- Deviation Calculation ---

    // Step 3: Calculate the sum of absolute differences between each element
    // in the transformed sequence and the calculated median-like pivot.
    let totalDeviation = 0;
    // Iterate through the sorted sequence using a for...of loop for readability.
    for (const sequenceElement of transformedSequence) {
        // Add the absolute difference to the running total.
        totalDeviation += Math.abs(sequenceElement - medianEstimate);
    }

    // --- Output Result ---

    // Print the final calculated sum of deviations to standard output.
    console.log(totalDeviation);
}

// --- Program Entry Point ---

// Read the entire input from standard input (/dev/stdin) as a UTF-8 string.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input:
// 1. Trim any leading/trailing whitespace (like extra newlines).
// 2. Split the string into an array of lines based on newline characters.
const inputLines = rawInputBuffer.trim().split('\n');

// Invoke the main processing function with the prepared input lines.
processInputData(inputLines);