'use strict'; // Enforce strict parsing and error handling for better code quality

/**
 * Processes raw input data to rearrange a sequence of numbers based on specific parity rules.
 * The first line of input specifies the count of numbers, and the second line contains the numbers themselves.
 *
 * @param {string} rawData - The complete input string read from a source (e.g., standard input).
 */
function processInput(rawData) {
    // Step 1: Parse the incoming raw string data.
    // First, split the entire string into individual lines.
    // Then, for each line, split it further by spaces to get an array of tokens.
    // This results in a 2D array where each sub-array represents a line's content.
    let parsedLines = rawData.split('\n').map(lineContent => lineContent.split(' '));

    // Step 2: Extract key information from the parsed input.
    // The total number of elements to process is found at the first position of the first line.
    // This value will be used as the upper bound for our iteration.
    const elementCount = parsedLines[0][0];

    // The actual sequence of numbers (as strings) is located on the second line of the input.
    const dataValues = parsedLines[1];

    // Step 3: Initialize the output string.
    // Start the result string with the very first element from the 'dataValues' array.
    // Using slice(0, 1) creates a new array containing only the first item,
    // and then toString() converts that single-element array into its string representation (e.g., ['5'] becomes '5').
    let finalSequence = dataValues.slice(0, 1).toString();

    // Step 4: Iterate through the remaining elements and build the sequence.
    // The loop starts from the second element (index 1) up to, but not including, 'elementCount'.
    for (let currentIdx = 1; currentIdx < elementCount; currentIdx++) {
        // Determine the insertion logic based on the parity (even/odd) of the current index
        // and the total element count.
        // If both 'currentIdx' and 'elementCount' have the same parity (both even or both odd),
        // append the current number to the end of the 'finalSequence'.
        if (currentIdx % 2 == elementCount % 2) {
            finalSequence = finalSequence + ' ' + dataValues[currentIdx];
        }
        // Otherwise (if their parities differ), prepend the current number to the beginning
        // of the 'finalSequence'.
        else {
            finalSequence = dataValues[currentIdx] + ' ' + finalSequence;
        }
    }

    // Step 5: Output the final constructed string to the standard console.
    console.log(finalSequence);
}

// Entry point: Read the entire content from standard input synchronously
// using Node.js's file system module, and then pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
