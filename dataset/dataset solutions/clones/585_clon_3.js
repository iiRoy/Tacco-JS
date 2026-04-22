// Import the Node.js file system module for reading input
const fileSystem = require('fs');

/**
 * Function to repeatedly reduce a string by removing sequences of 4 or more identical digits.
 * It updates a shared minimum length tracker object if a shorter sequence is found.
 *
 * @param {string} targetSequence The string sequence to be processed.
 * @param {{value: number}} minLengthTracker A mutable object holding the current overall minimum length.
 */
function processAndReduceSequence(targetSequence, minLengthTracker) {
    let sequenceLengthBeforeReduction; // Variable to store the string's length before each reduction attempt
    let currentProcessedSequence = String(targetSequence); // Ensure it's a string and create a local, mutable copy

    // Regular expression to find groups of 4 or more identical digits (1s, 2s, or 3s)
    // Using a backreference \1 to match the same digit 3 or more times after the first one.
    const reductionRegex = /([123])\1{3,}/g;

    // Continue reducing the string as long as its length changes after a reduction attempt,
    // indicating that a reduction actually occurred.
    do {
        sequenceLengthBeforeReduction = currentProcessedSequence.length; // Capture length before replacement
        currentProcessedSequence = currentProcessedSequence.replace(reductionRegex, ''); // Remove identified sequences
    } while (currentProcessedSequence.length < sequenceLengthBeforeReduction); // Loop if a reduction made the string shorter

    // After all possible reductions, compare the final length with the tracked minimum.
    // Update the global minimum length if this processed sequence is shorter.
    if (currentProcessedSequence.length < minLengthTracker.value) {
        minLengthTracker.value = currentProcessedSequence.length;
    }
}

// Read the entire content of standard input, decoded as UTF-8.
// This is typically used for competitive programming environments.
let rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
let inputDataLines = rawInputContent.trim().split('\n');

// An object to hold the overall minimum length across all test cases.
// Using an object allows passing it by reference to `processAndReduceSequence` so it can be mutated.
let globalMinimumLengthContainer = { value: Infinity };

// A small helper function to create a shallow clone of an array using the spread syntax.
const duplicateArray = (originalArray) => [...originalArray];

// Main loop to process multiple test cases (blocks of input).
// It continues until a block size of 0 is encountered.
let continueProcessing = true;
while (continueProcessing) {
    // Read the number of elements for the current block.
    // Number.parseInt is used for explicit base-10 conversion, which is safer than `-0`.
    let currentBlockSize = Number.parseInt(inputDataLines.shift(), 10);

    // If the parsed block size is 0, it signals the end of the input stream.
    if (currentBlockSize === 0) {
        continueProcessing = false; // Set flag to exit the loop
        // console.debug("End of input stream detected. Terminating processing.");
        break; // Explicitly break out of the while loop
    }

    // Initialize an array to store the numeric digits for the current block.
    let digitsForCurrentBlock = [];
    // Populate the digit array by reading 'currentBlockSize' number of lines.
    for (let elementIndex = 0; elementIndex < currentBlockSize; elementIndex++) {
        let currentNumericValue = Number.parseInt(inputDataLines.shift(), 10);
        digitsForCurrentBlock.push(currentNumericValue);
    }

    // Reset the minimum length tracker for the current test case/block.
    // Each block starts with a fresh search for its minimum length.
    globalMinimumLengthContainer.value = Infinity;

    // Iterate through each possible position in the current digit block to simulate modifications.
    for (let modificationIndex = 0; modificationIndex < currentBlockSize; modificationIndex++) {
        // --- Scenario 1: Replace the digit at `modificationIndex` with the next digit ---
        let firstModifiedDigitArray = duplicateArray(digitsForCurrentBlock);
        // Ensure there is a next element to copy from.
        if (modificationIndex < currentBlockSize - 1) {
            // Store the value of the next element in a temporary variable for clarity.
            let valueFromNextPosition = firstModifiedDigitArray[modificationIndex + 1];
            firstModifiedDigitArray[modificationIndex] = valueFromNextPosition;
        }
        // Convert the modified array to a string and process it.
        processAndReduceSequence(firstModifiedDigitArray.join(''), globalMinimumLengthContainer);

        // --- Scenario 2: Replace the digit at `modificationIndex` with the previous digit ---
        let secondModifiedDigitArray = duplicateArray(digitsForCurrentBlock);
        // Ensure there is a previous element to copy from.
        if (modificationIndex > 0) {
            // Store the value of the previous element in a temporary variable for clarity.
            let valueFromPreviousPosition = secondModifiedDigitArray[modificationIndex - 1];
            secondModifiedDigitArray[modificationIndex] = valueFromPreviousPosition;
        }
        // Convert the modified array to a string and process it.
        processAndReduceSequence(secondModifiedDigitArray.join(''), globalMinimumLengthContainer);
    }

    // After processing all modifications for the current block, output the minimum length found.
    console.log(globalMinimumLengthContainer.value);
}

// Optional: Add a final message or perform cleanup actions after all blocks are processed.
// console.info("All input blocks have been processed successfully by the application.");