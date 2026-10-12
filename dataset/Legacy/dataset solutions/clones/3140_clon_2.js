"use strict"; // Enforce strict parsing and error handling

/**
 * Processes input data to calculate a specific result.
 * @param {string} inputDataRaw - The raw string input from standard input.
 * @returns {string} The final processed output string.
 */
function ProcessInput(inputDataRaw) {
    // Prepare the input by trimming, splitting into lines, and reversing for easy popping.
    let processedLines = inputDataRaw.trim().split("\n").reverse();
    // Initialize an array to accumulate output lines.
    let outputCollector = [];

    /**
     * Retrieves the next line from the processed input.
     * @returns {string} The next line of input.
     */
    function fetchLine() {
        return processedLines.pop();
    }

    /**
     * Adds a value to the output buffer.
     * @param {*} valueToEmit - The value to be added to the output.
     */
    function emitOutput(valueToEmit) {
        outputCollector.push(valueToEmit);
    }

    /**
     * Converts an array of string numbers to an array of integers.
     * @param {string[]} stringArray - An array of strings representing numbers.
     * @returns {number[]} An array of parsed integers.
     */
    function parseNumbers(stringArray) {
        return stringArray.map(strNum => parseInt(strNum, 10)); // Explicit radix for parseInt
    }

    // Read the first line containing N, M, and C.
    let initialParams = parseNumbers(fetchLine().split(" "));
    let numRows = initialParams[0]; // N
    let numCols = initialParams[1]; // M
    let constantOffset = initialParams[2]; // C

    // Read the second line containing the array B.
    let weightsArray = parseNumbers(fetchLine().split(" "));

    // Initialize a counter for positive sums.
    let positiveCount = 0;

    // Iterate through N subsequent rows.
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        // Read the current row's array A.
        let currentRow = parseNumbers(fetchLine().split(" "));
        // Initialize the sum for the current row with the constant offset.
        let currentSum = constantOffset;

        // Calculate the dot product of A and B, adding to the sum.
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            currentSum += currentRow[colIndex] * weightsArray[colIndex];
        }

        // If the calculated sum is positive, increment the counter.
        if (currentSum > 0) {
            positiveCount++;
        }
    }

    // Output the final count.
    emitOutput(positiveCount);

    // Join all collected output lines with newlines.
    let finalOutputString = outputCollector.join("\n");
    // Print the final output to the console.
    console.log(finalOutputString);
    // Return the final output string.
    return finalOutputString;
}

// Execute the main processing function with input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
