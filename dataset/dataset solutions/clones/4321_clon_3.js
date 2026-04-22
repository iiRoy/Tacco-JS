'use strict';

/**
 * Processes raw input string to calculate a specific sum based on paired numeric data.
 * The input format is expected to be a single space-separated string containing:
 * An initial count (N) followed by N pairs of numbers (A1 B1 A2 B2 ... AN BN).
 * The function's core logic identifies the maximum 'A' value among all pairs
 * and then computes the sum of this maximum 'A' value and its corresponding 'B' value.
 * The implementation ensures robustness against malformed input where N might not
 * strictly match the actual number of available pairs.
 *
 * @param {string} rawInputString - The complete input data provided as a single string.
 */
function processInputData(rawInputString) {
    // Step 1: Preliminary input validation and parsing.
    // Check if the input string is empty or contains only whitespace.
    // If so, output a default sum of 0 and terminate execution.
    if (!rawInputString || rawInputString.trim() === '') {
        console.log(0);
        return;
    }

    // Trim whitespace, split the string into segments using any sequence of
    // whitespace characters as delimiters, and convert each segment into an integer.
    // Using parseInt with radix 10 ensures explicit base conversion.
    let numericElements = rawInputString.trim().split(/\s+/).map(segment => parseInt(segment, 10));

    // Step 2: Extract the initial count indicator.
    // The very first number in the input stream is conceptually 'N',
    // indicating the number of subsequent A-B pairs. Although the original
    // logic doesn't strictly enforce this count for loop iteration,
    // it is consumed as per the original structure.
    if (numericElements.length === 0) {
        console.log(0); // If no numbers are parsed, output 0.
        return;
    }
    let nominalPairCount = numericElements.shift(); // Consume the 'N' value.

    // Step 3: Populate two distinct lists for primary (A) and secondary (B) values.
    // This process iterates through the remaining numeric elements, extracting
    // pairs (A_i, B_i) sequentially. The loop continues as long as there are
    // at least two elements left to form a complete pair.
    let primaryValuesCollection = [];   // Stores all A_i values.
    let secondaryValuesCollection = []; // Stores all B_i values, corresponding to A_i by index.

    while (numericElements.length >= 2) {
        let currentPrimaryElement = numericElements.shift();   // Fetch the next A value.
        let currentSecondaryElement = numericElements.shift(); // Fetch the next B value.

        // Validate that both extracted elements are indeed valid numbers.
        // If a non-numeric value is encountered, log a warning and skip this pair
        // to maintain data integrity and prevent errors in subsequent calculations.
        if (isNaN(currentPrimaryElement) || isNaN(currentSecondaryElement)) {
            console.warn(`Warning: Found non-numeric data in a pair. Skipping: (${currentPrimaryElement}, ${currentSecondaryElement})`);
            continue; // Discard this invalid pair and proceed to the next.
        }

        primaryValuesCollection.push(currentPrimaryElement);
        secondaryValuesCollection.push(currentSecondaryElement);
    }

    // Step 4: Determine the maximum value within the 'primaryValuesCollection'
    // and identify its associated value from 'secondaryValuesCollection'.
    // This is performed in a single iterative pass for efficiency.
    let maximumPrimaryValue = -Infinity; // Initialize with the lowest possible numeric value.
    let correspondingSecondaryValue = 0; // Default value for the linked secondary component.

    // If no valid pairs were successfully collected, output 0 as the sum.
    if (primaryValuesCollection.length === 0) {
        console.log(0);
        return;
    }

    for (let i = 0; i < primaryValuesCollection.length; i++) {
        let currentIteratedPrimary = primaryValuesCollection[i];
        // If the current primary value surpasses the highest value found so far,
        // update both the maximum primary value and its direct counterpart from the secondary collection.
        if (currentIteratedPrimary > maximumPrimaryValue) {
            maximumPrimaryValue = currentIteratedPrimary;
            correspondingSecondaryValue = secondaryValuesCollection[i];
        }
    }

    // Step 5: Compute and output the final aggregate sum.
    // The sum is calculated by adding the identified maximum primary value
    // to its corresponding secondary value.
    let finalComputedAggregateSum = maximumPrimaryValue + correspondingSecondaryValue;
    console.log(finalComputedAggregateSum);
}

// Entry point for script execution: Acquire input from the standard input stream.
// This section handles the file system interaction and basic error management.
const fileSystemUtilityModule = require('fs');
const standardInputFilepath = '/dev/stdin';
let inputContentFromStream;

try {
    // Attempt to synchronously read the entire content of the standard input file.
    // The 'utf8' encoding ensures proper character interpretation.
    inputContentFromStream = fileSystemUtilityModule.readFileSync(standardInputFilepath, 'utf8');
} catch (readingError) {
    // If an error occurs during file reading (e.g., file does not exist, permission denied),
    // log the error details and provide an empty string as a fallback input to prevent application termination.
    console.error("An error occurred during standard input reading:", readingError.message);
    inputContentFromStream = ""; // Provide an empty string to allow the main function to handle it gracefully.
}

// Invoke the primary data processing function using the content obtained from standard input.
processInputData(inputContentFromStream);