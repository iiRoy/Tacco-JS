"use strict";

/**
 * Core function to process incoming text data.
 * @param {string} rawData - The complete input string received.
 */
function ProcessInput(rawData) {
    // Divide the entire input string into an array of separate lines.
    let processedData = rawData.split("\n");

    // Transform each string line into an array of numerical values.
    // Each line is first broken by spaces, then every segment is converted to a number.
    const parsedLines = processedData.map(function(currentLineStr) {
        return currentLineStr.split(" ").map(Number);
    });

    // Initialize a mutable string to accumulate the final output.
    let resultBuffer = "";

    // Iterate through the numerical arrays until a pair of zeros is encountered.
    // The loop continues as long as the sum of the first two elements is non-zero (truthy).
    for (let idx = 0; parsedLines[idx][0] + parsedLines[idx][1]; idx++) {
        // Arrange the numbers within the current array in ascending order.
        parsedLines[idx].sort();
        // Concatenate the sorted numbers with a space, remove any extraneous whitespace,
        // append a newline character, and add this formatted string to the buffer.
        resultBuffer += parsedLines[idx].join(" ").trim() + "\n";
    }

    // Display the accumulated results to the standard output.
    console.log(resultBuffer);
}

/**
 * A supplementary function designed for browser-based testing or debugging.
 * This function is not integral to the primary data processing logic.
 */
function testFunction() {
    // Retrieve the value from a DOM element identified by "input".
    const testData = document.getElementById("input").value;
    // Invoke the main processing routine with the collected test data.
    ProcessInput(testData);
}

// Execute the primary processing function using data acquired from standard input.
// This specific invocation is tailored for a Node.js execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
