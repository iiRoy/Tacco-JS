const fs = require('fs');

// Expert clone generation: Type III
// This script processes multiple datasets from standard input.
// Each dataset begins with a configuration line specifying the number of elements (N)
// and a target sum threshold (S). Following this, N lines contain individual numeric values.
// The primary objective is to determine, for each dataset, how many unique pairs of numbers
// within that dataset have a sum strictly greater than the provided target sum S.
// The process continues until a configuration line with N=0 and S=0 is encountered.

/**
 * Reads the entire content from the standard input stream.
 * Assumes UTF-8 encoding for the input data.
 * @type {string}
 */
const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');

/**
 * Processes the raw input content:
 * 1. Trims leading/trailing whitespace from the entire input.
 * 2. Splits the cleaned input into an array of individual lines.
 * @type {string[]}
 */
const inputDataLines = rawInputContent.trim().split('\n');

/**
 * Parses a string line expected to contain two space-separated integers.
 * @param {string} lineToParse - The string line to be parsed (e.g., "5 100").
 * @returns {number[]} An array containing two integers [N, S]. Returns [0, 0]
 *                     if parsing fails or line is malformed, assuming this
 *                     will trigger the loop termination condition.
 */
const extractParameters = (lineToParse) => {
    // Split the line by spaces and attempt to convert each part to an integer.
    const numericParts = lineToParse.split(' ').map(segment => Number.parseInt(segment, 10));

    // Basic validation for the number of parameters and their numeric nature.
    if (numericParts.length < 2 || isNaN(numericParts[0]) || isNaN(numericParts[1])) {
        // Fallback or error handling for malformed configuration lines.
        // In competitive programming, input format is usually guaranteed.
        return [0, 0];
    }
    return numericParts;
};

let shouldContinueProcessing = true; // A flag to control the main data processing loop.

// Begin the main loop to process each dataset sequentially.
while (shouldContinueProcessing) {
    // Attempt to retrieve the next configuration line from the processed input.
    const currentConfigLine = inputDataLines.shift();

    // If there are no more lines, or the line is empty, it signifies end of input.
    if (!currentConfigLine) {
        shouldContinueProcessing = false; // Set flag to exit the loop gracefully.
        continue; // Skip remaining logic for this iteration.
    }

    // Parse the dataset size (N) and the target sum (S) from the configuration line.
    const [elementsCount, sumThreshold] = extractParameters(currentConfigLine);

    // Check for the global termination condition: N=0 and S=0.
    if (elementsCount === 0 && sumThreshold === 0) {
        shouldContinueProcessing = false; // Update flag to terminate the loop.
        continue; // Proceed to the next loop iteration, which will now exit.
    }

    /**
     * Stores the numeric values for the current dataset.
     * @type {number[]}
     */
    const currentNumericSet = [];
    let itemsReadForCurrentSet = 0; // Keep track of how many items have been processed.

    // Read 'elementsCount' individual numeric values for the current dataset.
    while (itemsReadForCurrentSet < elementsCount) {
        const valueLine = inputDataLines.shift(); // Get the next line which should be a number.

        // Robustness check: if a line is unexpectedly missing.
        if (valueLine === undefined || valueLine === null) {
            // This indicates an issue with the input data format.
            console.error("Data input error: Expected more data lines but none found. Terminating.");
            shouldContinueProcessing = false; // Force exit from the outer processing loop.
            break; // Exit the inner loop for reading items.
        }

        const parsedValue = Number.parseInt(valueLine, 10);

        // Validate if the parsed value is a valid number.
        if (!isNaN(parsedValue)) {
            currentNumericSet.push(parsedValue);
        } else {
            // Log a warning for non-numeric input but try to continue if possible.
            console.warn(`Warning: Skipping non-numeric input '${valueLine}' in dataset.`);
        }
        itemsReadForCurrentSet++;
    }

    // A final check to ensure the number of items read matches the declared 'elementsCount'.
    if (currentNumericSet.length !== elementsCount) {
        console.error(`Dataset integrity warning: Declared ${elementsCount} items, but successfully read ${currentNumericSet.length}. Skipping this potentially malformed dataset.`);
        // Move to the next dataset (or terminate if shouldContinueProcessing was set to false).
        continue;
    }

    // Sort the collected numeric values in ascending order.
    // This sorting step is critical for the efficiency of the pair-counting algorithm.
    currentNumericSet.sort((valA, valB) => valA - valB);

    let pairsExceedingThreshold = 0; // Initialize counter for valid pairs.

    // Iterate through the sorted array to find pairs whose sum exceeds the threshold.
    // The outer loop selects the first element of a potential pair.
    for (let outerElementIndex = 0; outerElementIndex < elementsCount; outerElementIndex++) {
        // The inner loop selects the second element, ensuring it's distinct
        // and appears after the first element in the sorted array.
        for (let innerElementIndex = outerElementIndex + 1; innerElementIndex < elementsCount; innerElementIndex++) {
            const currentPairSum = currentNumericSet[outerElementIndex] + currentNumericSet[innerElementIndex];

            // If the sum of the current pair exceeds the desired threshold:
            if (currentPairSum > sumThreshold) {
                // Optimization: Due to the array being sorted, if
                // currentNumericSet[outerElementIndex] + currentNumericSet[innerElementIndex] > sumThreshold,
                // then any pair involving currentNumericSet[outerElementIndex] and any element
                // currentNumericSet[k] where k > innerElementIndex will also have a sum
                // greater than sumThreshold.
                // Therefore, we can immediately add the count of remaining elements
                // from innerElementIndex to the end of the array to our total.
                pairsExceedingThreshold += (elementsCount - innerElementIndex);
                break; // Exit the inner loop and move to the next outer element.
                      // This is because all subsequent pairs with the current outerElementIndex
                      // would also satisfy the condition.
            }
            // If currentPairSum <= sumThreshold, continue to the next innerElementIndex.
            // The current outerElementIndex might still form a valid pair with a larger number.
        }
    }

    // Output the final count of pairs that met the criteria for the current dataset.
    console.log(pairsExceedingThreshold);
}