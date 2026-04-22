"use strict"; // Enforce strict mode for cleaner code execution.

// This primary function handles the incoming textual data.
const processData = sourceText => {
    // First, clean up leading/trailing whitespace and split the input string by newlines.
    sourceText = sourceText.trim().split('\n');

    // Extract the total count of items (equivalent to N) from the first line of input.
    const totalElements = parseInt(sourceText[0].split(' ')[0], 10);
    // Extract the designated segment length (equivalent to K) from the first line.
    const windowLength = parseInt(sourceText[0].split(' ')[1], 10);

    // Parse the second line of input, splitting by spaces and converting each part to an integer.
    const inputNumbers = sourceText[1].split(' ').map(numericItem => parseInt(numericItem, 10));

    // Initialize a variable to maintain the product within the current sliding window.
    let rollingProduct = 1;
    // Create an array to store the series of calculated products for each window.
    let productSequence = [];

    // Calculate the initial product for the very first window of 'windowLength' elements.
    for (let loopIndex = 0; loopIndex < windowLength; loopIndex++) {
        rollingProduct *= inputNumbers[loopIndex];
    }

    // Store the product of the first window in our sequence.
    productSequence.push(rollingProduct);

    // Now, iterate through the remaining elements to compute products for subsequent sliding windows.
    for (let loopIndex = windowLength; loopIndex < totalElements; loopIndex++) {
        // To slide the window, first divide out the number that is exiting the window from the left.
        rollingProduct /= inputNumbers[loopIndex - windowLength];
        // Then, multiply in the new number that is entering the window from the right.
        rollingProduct *= inputNumbers[loopIndex];

        // Add this newly calculated rolling product to our growing sequence.
        productSequence.push(rollingProduct);
    }

    // Initialize an array to hold the comparison outcomes (e.g., "Yes" or "No").
    let verdictArray = [];

    // Determine the total number of products that have been stored in the sequence.
    let seriesSize = productSequence.length;

    // Perform a pairwise comparison for adjacent products within the sequence.
    for (let loopIndex = 1; loopIndex < seriesSize; loopIndex++) {
        // If the current product is found to be less than or equal to its immediate predecessor...
        if (productSequence[loopIndex] <= productSequence[loopIndex - 1]) {
            verdictArray.push("No"); // ...then append "No" to our verdict list.
        } else {
            verdictArray.push("Yes"); // Otherwise, append "Yes" to indicate an increase.
        }
    }

    // Finally, output all the collected verdicts, each separated by a newline character.
    console.log(verdictArray.join('\n'));
};

// Read the entire content from standard input synchronously using Node.js's file system module,
// and then pass this content as a UTF-8 string to our main processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));