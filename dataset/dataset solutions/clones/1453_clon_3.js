/*
 * This module facilitates reading standard input in a Node.js environment
 * and executing a specific data processing routine on the received payload.
 * It ensures compatibility and robust handling of input streams.
 */

// Define a consistent output mechanism for displaying results.
const outputDisplay = console.log;

// Check if running in a Node.js-like environment to handle standard input.
if (typeof process !== "undefined" && process.stdin && typeof process.stdin.resume === 'function') {
    let receivedDataBuffer = []; // Accumulates chunks of incoming data.
    const standardInput = process.stdin; // Reference to the standard input stream.

    // Ensure the input stream is active and set its encoding.
    standardInput.resume();
    standardInput.setEncoding('utf8');

    // Attach event listener for 'data' chunks.
    standardInput.on('data', (dataChunk) => {
        receivedDataBuffer.push(dataChunk); // Add each received chunk to the buffer.
    });

    // Attach event listener for 'end' of input stream.
    standardInput.on('end', () => {
        // Once all data is received, concatenate it and initiate primary processing.
        const fullPayload = receivedDataBuffer.join('');
        initiateDataProcessing(fullPayload);
    });
} else {
    // Fallback or warning for non-Node environments if necessary.
    // For this specific problem, it's assumed to run in Node.
    // outputDisplay("Warning: Not running in a Node.js environment, stdin handling skipped.");
}

/**
 * Orchestrates the initial parsing and preparation of the raw input string.
 * This function handles common input formatting like line breaks and filtering.
 *
 * @param {string} rawStringPayload - The complete string received from standard input.
 */
function initiateDataProcessing(rawStringPayload) {
    // Normalize line endings and split the payload into individual lines.
    const allInputSegments = String(rawStringPayload).split(/\r?\n/);

    // Basic validation: ensure there are enough lines to process after trimming.
    if (allInputSegments.length < 3) {
        outputDisplay("Error: Insufficient input lines for processing.");
        return; // Exit if input is too short.
    }

    // Remove the very first and very last lines, as per problem specification.
    // This creates a new array without modifying the original.
    const relevantInputSegments = allInputSegments.slice(1, allInputSegments.length - 1);

    // Pass the filtered lines to the core business logic function.
    executeMainLogic(relevantInputSegments);
}

/**
 * Contains the core business logic for processing the filtered input lines.
 * It extracts the target numeric sequence, sorts it, and prints the result.
 *
 * @param {string[]} filteredLineCollection - An array of strings, each representing a line of input.
 */
function executeMainLogic(filteredLineCollection) {
    // Ensure the collection is not empty after filtering.
    if (!filteredLineCollection || filteredLineCollection.length === 0) {
        outputDisplay("No valid lines found for core logic execution.");
        return;
    }

    // Retrieve the final line from the (already filtered) collection.
    // This line is expected to contain the numbers to be sorted.
    const targetLineForSorting = filteredLineCollection[filteredLineCollection.length - 1];

    // Check if the target line is valid and not empty.
    if (!targetLineForSorting || targetLineForSorting.trim() === '') {
        outputDisplay("The target line for sorting is empty or invalid.");
        return;
    }

    // Split the target line by spaces, then convert each part to a number.
    // A custom mapping function is used for clarity and potential error handling.
    const parsedNumericValues = targetLineForSorting.split(" ").map(segment => {
        const num = Number(segment);
        // Basic check to ensure valid numbers are being processed.
        if (isNaN(num)) {
            // Optionally handle non-numeric segments, e.g., filter them out or log a warning.
            // For now, we'll let `Number()` return NaN, which might affect sorting if not handled.
            // A more robust solution might filter these out: `return null;` then `.filter(n => n !== null)`
        }
        return num;
    });

    // Remove any NaN values that might have resulted from conversion errors.
    const validNumericValues = parsedNumericValues.filter(Number.isFinite);

    if (validNumericValues.length === 0) {
        outputDisplay("No valid numbers found in the target line to sort.");
        return;
    }

    // Sort the array of numbers in ascending order.
    // The comparison function (a - b) ensures numerical sorting.
    const sortedNumericSequence = validNumericValues.sort((valA, valB) => {
        // Simple ascending numerical sort.
        return valA - valB;
    });

    // Join the sorted numbers back into a single string, separated by spaces.
    const finalFormattedOutput = sortedNumericSequence.join(" ");

    // Display the final result using the predefined output mechanism.
    outputDisplay(finalFormattedOutput);
}