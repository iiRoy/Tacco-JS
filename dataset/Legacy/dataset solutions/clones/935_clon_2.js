// This script processes pairs of strings from standard input.

var outputFunc = console.log; // Alias for console logging.

// Check if running in a Node.js-like environment to handle input.
if (typeof process !== "undefined") {
    let rawInputData = ""; // Accumulates all incoming data.
    process.stdin.resume(); // Ensure stdin stays open.
    process.stdin.setEncoding('utf8'); // Set character encoding for input.

    // Event listener for incoming data chunks.
    process.stdin.on('data', function (chunk) {
        rawInputData += chunk; // Append chunk to the raw input.
    });

    // Event listener for the end of input stream.
    process.stdin.on('end', function () {
        // Split the accumulated input into an array of lines.
        let inputLines = rawInputData.split("\n");
        processInputData(inputLines); // Call the main processing function.
    });
}

// Main function to orchestrate the processing of input lines.
function processInputData(inputLines) {
    inputLines.shift(); // Discard the first line (often a count, not used here).

    // Loop through the input lines, processing them in pairs.
    while (inputLines.length > 0) {
        try {
            // Extract the next two lines as a dataset pair.
            let currentPair = inputLines.slice(0, 2);

            // Process each string in the pair:
            // 1. Split into individual characters.
            // 2. Filter to keep only lowercase English letters (a-z).
            // 3. Join the filtered characters back into a string.
            currentPair = currentPair.map(function (singleLine) {
                return singleLine.split("").filter(function (charElement) {
                    let charCodeValue = charElement.charCodeAt(0);
                    return charCodeValue >= 97 && charCodeValue <= 122; // ASCII 'a' to 'z'
                }).join("");
            });

            // Pass the cleaned string pair to the core analysis function.
            analyzeStringPair(currentPair);

            // Remove the two processed lines from the input array.
            inputLines = inputLines.slice(2);
        } catch (errObject) {
            // Log any errors encountered during processing a pair.
            outputFunc(errObject);
        }
    }
}

// Function to analyze a pair of strings using dynamic programming.
function analyzeStringPair(currentPair) {
    let dpMatrix = []; // Initialize a 2D array for dynamic programming.
    let firstString = currentPair[0]; // The first string for comparison.
    let secondString = currentPair[1]; // The second string for comparison.

    // Iterate through each character of the first string.
    for (let rowIdx = 0; rowIdx < firstString.length; rowIdx++) {
        dpMatrix[rowIdx] = []; // Initialize the current row of the matrix.

        // Iterate through each character of the second string.
        for (let colIdx = 0; colIdx < secondString.length; colIdx++) {
            // If characters at current indices match, set initial value to 1, else 0.
            if (firstString.charAt(rowIdx) === secondString.charAt(colIdx)) {
                dpMatrix[rowIdx][colIdx] = 1;
            } else {
                dpMatrix[rowIdx][colIdx] = 0;
            }

            // Apply dynamic programming rules based on position in the matrix.
            if (rowIdx === 0 && colIdx === 0) {
                // For the very first cell, no change.
                dpMatrix[rowIdx][colIdx] += 0;
            } else if (rowIdx === 0) {
                // For the first row (after the first cell), take max from left.
                dpMatrix[rowIdx][colIdx] = Math.max(dpMatrix[rowIdx][colIdx - 1], dpMatrix[rowIdx][colIdx]);
            } else if (colIdx === 0) {
                // For the first column (after the first cell), take max from top.
                dpMatrix[rowIdx][colIdx] = Math.max(dpMatrix[rowIdx - 1][colIdx], dpMatrix[rowIdx][colIdx]);
            } else {
                // For all other cells, apply a more complex rule.
                // It involves the maximum of top and left cells, plus the current match value,
                // capped by the minimum of current indices plus one.
                dpMatrix[rowIdx][colIdx] = Math.min(
                    Math.max(dpMatrix[rowIdx - 1][colIdx], dpMatrix[rowIdx][colIdx - 1]) + dpMatrix[rowIdx][colIdx],
                    Math.min(rowIdx, colIdx) + 1
                );
            }
        }
    }
    // Output the final computed value from the bottom-right cell of the matrix.
    outputFunc(dpMatrix[rowIdx - 1][colIdx - 1]);
}
