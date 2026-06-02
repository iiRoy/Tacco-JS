'use strict'; // Enforce strict mode for cleaner code execution.

process.stdin.resume(); // Keep the standard input stream open.
process.stdin.setEncoding('utf-8'); // Specify UTF-8 encoding for incoming data.

let rawInputData = ''; // Buffer to accumulate all received standard input.
let lineIndex = 0;     // Pointer to track the current line being processed from the input.

// Event handler for when data chunks are received from standard input.
process.stdin.on('data', chunkOfData => {
    rawInputData += chunkOfData; // Append the new data chunk to the buffer.
});

// Event handler for when the standard input stream ends.
process.stdin.on('end', () => {
    // Process the accumulated input:
    // 1. Trim leading/trailing whitespace from the entire input.
    // 2. Split the input into an array of lines based on newline characters.
    // 3. For each line, trim leading/trailing whitespace.
    rawInputData = rawInputData.trim().split('\n').map(singleLine => {
        return singleLine.trim();
    });

    // Once all input has been parsed and prepared, initiate the main program logic.
    executeProgram();
});

/**
 * Retrieves the next available line from the processed input data.
 * Increments the internal line counter after retrieval.
 * @returns {string} The string content of the next line.
 */
function readNextLine() {
    return rawInputData[lineIndex++]; // Return the current line and then advance the index.
}

/**
 * Converts a space-separated string of numbers into an array of numerical values.
 * @param {string} inputStr - The string containing numbers separated by spaces.
 * @returns {number[]} An array where each element is a number.
 */
function parseNumArray(inputStr) {
    return inputStr.split(' ').map(val => Number(val));
}

/**
 * Transforms a string representation into its integer equivalent.
 * @param {string} inputStr - The string to be converted to an integer.
 * @returns {number} The integer value derived from the string.
 */
function parseInteger(inputStr) {
    return Number(inputStr);
}

/**
 * Splits a space-separated string into an array of strings.
 * (This utility function is present but not utilized in the current problem's logic).
 * @param {string} inputStr - The string to be split.
 * @returns {string[]} An array of string segments.
 */
function parseStringArray(inputStr) {
    return inputStr.split(' ').map(val => val);
}

// --- Main application logic for the frog jump problem ---

/**
 * Orchestrates the solution for the frog jump problem.
 * It reads input, computes the minimum cost to reach the final stone,
 * and outputs the result.
 */
function executeProgram() {
    // Read the first line of input, which contains N (arrayLength) and K (maxJump).
    const initialParams = parseNumArray(readNextLine());
    const arrayLength = initialParams[0]; // N: Total number of stones.
    const maxJump = initialParams[1];     // K: Maximum distance a frog can jump.

    // Read the second line of input, which contains the heights of all stones.
    const inputNumbers = parseNumArray(readNextLine());

    // Initialize a dynamic programming array to store the minimum cost to reach each stone.
    // `minCost[i]` will hold the minimum cost to arrive at stone `i`.
    const minCost = new Array(arrayLength);
    minCost.fill(-1); // Populate the array with -1 to signify uncomputed states.

    // Establish base cases for the DP calculation:
    minCost[0] = 0; // The cost to reach the first stone (index 0) is zero.
    // The cost to reach the second stone (index 1) is the absolute height difference from stone 0.
    minCost[1] = Math.abs(inputNumbers[1] - inputNumbers[0]);

    // Iterate through the stones starting from the third stone (index 2) up to the last one.
    for (let currentIndex = 2; currentIndex < arrayLength; currentIndex++) {
        let currentMinCost = 100; // Initialize with a sufficiently large value to find the minimum.

        // For the current stone, consider all possible previous stones from which a jump could have been made.
        // A jump can be made from `currentIndex - jumpDistance`, where `jumpDistance` ranges from 1 to `maxJump`.
        for (let jumpDistance = 1; jumpDistance <= maxJump; jumpDistance++) {
            // Ensure that the potential previous stone's index is valid (not negative).
            if (currentIndex - jumpDistance >= 0) {
                // Calculate the cost to reach `currentIndex` from `currentIndex - jumpDistance`.
                // This cost is `minCost[currentIndex - jumpDistance]` (cost to reach previous stone)
                // plus `Math.abs(inputNumbers[currentIndex] - inputNumbers[currentIndex - jumpDistance])`
                // (cost of the current jump).
                currentMinCost = Math.min(currentMinCost, minCost[currentIndex - jumpDistance] + Math.abs(inputNumbers[currentIndex] - inputNumbers[currentIndex - jumpDistance]));
            }
        }
        // Store the determined minimum cost to reach the `currentIndex` stone.
        minCost[currentIndex] = currentMinCost;
    }

    // Output the minimum cost required to reach the very last stone (at index `arrayLength - 1`).
    console.log(minCost[arrayLength - 1]);
}
