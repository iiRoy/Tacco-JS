/**
 * Processes a sequence of heights to determine if it can be made non-increasing
 * by decrementing each height at most once, starting from the first element
 * which can also be decremented once if positive.
 * @param {string} rawInputData - The raw input string containing N and the heights.
 */
function checkHeightSequence(rawInputData) {
    // Split the input into individual lines for processing.
    const inputLines = rawInputData.split('\n');

    // Parse the number of elements from the first line.
    // Using Number() for explicit type conversion from string to number.
    const numberOfElements = Number(inputLines[0]);

    // Initialize the flag indicating if the sequence can be made non-increasing.
    // Using a boolean is generally more idiomatic and clear than string 'Yes'/'No'.
    let canFormNonIncreasing = true;

    // Handle edge cases for empty input or single element sequences.
    // An empty sequence is vacuously considered non-increasing.
    if (numberOfElements === 0) {
        console.log('Yes');
        return;
    }

    // Parse the height values from the second line of input.
    // The .map() function provides a concise way to transform string elements to integers.
    const heightStringsArray = inputLines[1].split(' ');
    const currentHeights = heightStringsArray.map(str => parseInt(str.trim(), 10));

    // Optional: Add more robust validation here for parsed height values
    // (e.g., checking for NaN or negative values) if input quality isn't guaranteed.

    // Apply the initial specific rule: the very first element can be decremented by one if it's positive.
    if (currentHeights[0] > 0) {
        currentHeights[0]--;
    }

    // Iterate through the sequence starting from the second element (index 1).
    // We compare each element with its immediate predecessor to enforce the non-increasing property.
    for (let processIndex = 1; processIndex < numberOfElements; processIndex++) {
        // Store the predecessor's height for clarity in comparison.
        const previousHeight = currentHeights[processIndex - 1];
        // The current height might be modified, so declare it with 'let'.
        let currentHeight = currentHeights[processIndex];

        // Core logic for checking and potentially adjusting heights:
        // 1. If the current height is more than one greater than the previous height,
        //    it's impossible to make it non-increasing (even with one decrement).
        if (currentHeight > previousHeight + 1) {
            canFormNonIncreasing = false; // Set the flag to false.
            break; // No need to check further, break out of the loop early.
        }
        // 2. If the current height is exactly one greater than the previous height,
        //    we MUST decrement the current height to satisfy the non-increasing condition.
        else if (currentHeight > previousHeight) {
            currentHeights[processIndex]--; // Apply the allowed decrement.
        }
        // 3. If currentHeight is already less than or equal to previousHeight,
        //    no action is needed for this pair, and the sequence remains valid so far.
    }

    // Output the final result based on the boolean flag.
    // Use a ternary operator for a compact 'Yes' or 'No' output.
    console.log(canFormNonIncreasing ? 'Yes' : 'No');
}

// Standard input reading setup for competitive programming environments.
// This part typically remains consistent as it handles external system interaction.
const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

// Execute the main processing function with the data read from standard input.
checkHeightSequence(fileSystem.readFileSync(standardInputPath, encodingType));