"use strict"; // Ensure strict mode for robust code execution.

const processInput = (inputData) => { // Define the primary routine for handling provided data.
    // Clean up the raw input string: remove leading/trailing whitespace and split into lines.
    const inputLines = inputData.trim().split("\n");

    // Parse the first line to extract key numerical parameters.
    // The first number specifies the count of elements, the second is the maximum allowed sum.
    const firstLineParts = inputLines[0].split(" ");
    const elementCount = parseInt(firstLineParts[0], 10); // Total number of elements expected in the sequence.
    const thresholdValue = parseInt(firstLineParts[1], 10); // The maximum allowed sum for adjacent pairs.

    // Process the second line to create an array of integers.
    // Each string element from the input is converted to its numerical equivalent.
    const numberSequence = inputLines[1].split(" ").map(itemVal => parseInt(itemVal, 10));

    let totalReduction = 0; // Initialize a variable to accumulate the total reduction applied.

    // Iterate through the array, checking adjacent pairs.
    // The loop runs from the first element up to the second-to-last element,
    // as each iteration considers the current element and its successor.
    for (let currentIdx = 0; currentIdx < elementCount - 1; ++currentIdx) {
        // Calculate the sum of the current element and its immediate successor.
        const adjacentTotal = numberSequence[currentIdx] + numberSequence[currentIdx + 1];

        // If the calculated sum exceeds the predefined threshold, adjustments are necessary.
        if (adjacentTotal > thresholdValue) {
            // Determine the exact excess amount that needs to be reduced.
            const excessAmount = adjacentTotal - thresholdValue;
            // Reduce the value of the next element in the sequence by the calculated excess amount.
            // This operation ensures that the pair's sum no longer exceeds the threshold.
            numberSequence[currentIdx + 1] -= excessAmount;
            // Add the determined excess amount to the overall reduction counter.
            totalReduction += excessAmount;
        }
    }

    // Output the final accumulated reduction value to the standard console.
    console.log(totalReduction);
};

// Initiate the entire process by reading input from the standard input stream.
// The file system module is utilized to synchronously read the content of '/dev/stdin' as UTF-8 encoded text.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));