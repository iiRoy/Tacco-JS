/**
 * Utility function to acquire all lines from standard input.
 * This reads the entire stream, assuming it's UTF-8 encoded,
 * and splits it into individual lines, removing potential carriage returns.
 * @returns {Array<string>} An array where each element is a line from stdin.
 */
function acquireDataStream() {
    // Import the file system module for synchronous reading operations.
    const fileSystemModule = require("fs"); 
    
    // Define the standard input path, typically /dev/stdin on Unix-like systems.
    const inputPath = "/dev/stdin";
    
    // Read the entire content of stdin synchronously as a Buffer.
    const rawBufferContent = fileSystemModule.readFileSync(inputPath);
    
    // Convert the buffer to a UTF-8 string.
    const entireStreamContent = rawBufferContent.toString('utf8');
    
    // Split the stream into lines, handling both LF and CRLF line endings.
    // Trim any trailing carriage returns explicitly.
    const contentLines = entireStreamContent.split('\n').map(line => line.replace('\r', ''));
    
    // A small guard to ensure we don't return an array with an empty string
    // if the input stream was completely empty or just whitespace.
    if (contentLines.length === 1 && contentLines[0].trim() === '') {
        return [];
    }

    return contentLines;
}

/**
 * Computes the number of unique combinations (i, j, k) such that 1 <= i < j < k <= limit and i + j + k = targetSum.
 * This function encapsulates the core combinatorial logic.
 * @param {number} limit - The upper bound for the numbers i, j, k.
 * @param {number} targetSum - The desired sum for i + j + k.
 * @returns {number} The count of combinations satisfying the criteria.
 */
function calculateCombinations(limit, targetSum) {
    let combinationTally = 0; // Initialize a counter for valid combinations.

    // Outer loop for the first number (i).
    // It iterates from 1 up to (limit - 2) because we need at least two distinct larger numbers (j and k).
    for (let firstValue = 1; firstValue <= limit - 2; firstValue++) {
        // Middle loop for the second number (j).
        // It starts from firstValue + 1 to ensure j > i.
        // It goes up to (limit - 1) because we need at least one distinct larger number (k).
        for (let secondValue = firstValue + 1; secondValue <= limit - 1; secondValue++) {
            // Inner loop for the third number (k).
            // It starts from secondValue + 1 to ensure k > j.
            // It goes up to limit.
            for (let thirdValue = secondValue + 1; thirdValue <= limit; thirdValue++) {
                // Check if the sum of the three distinct numbers equals the target sum.
                if (firstValue + secondValue + thirdValue === targetSum) {
                    combinationTally++; // Increment the counter if a match is found.
                }
            }
        }
    }
    return combinationTally;
}

/**
 * Processes a single line of input, extracting numeric parameters and
 * performing the combination calculation. It then prints the result.
 * @param {string} inputLine - A single line read from standard input.
 * @returns {boolean} Returns `true` to continue processing subsequent lines,
 *                    `false` if the line indicates termination (N=0 and X=0).
 */
function processInputRow(inputLine) {
    // Skip empty lines or lines consisting only of whitespace.
    const trimmedLine = inputLine.trim();
    if (!trimmedLine) {
        return true; // Continue processing if it's just an empty line.
    }

    // Split the line by space to get individual numeric tokens.
    const numericTokens = trimmedLine.split(' ');

    // Parse the first token as the upper bound (N).
    // Use parseInt with radix 10 for explicit conversion.
    const numericLimit = parseInt(numericTokens[0], 10);
    
    // Parse the second token as the target sum (X).
    const desiredSum = parseInt(numericTokens[1], 10);

    // Validate parsed numbers. If they are not valid numbers, skip this line but continue.
    if (isNaN(numericLimit) || isNaN(desiredSum)) {
        // Optionally, could log an error here, but problem implies valid input format.
        return true; 
    }

    // Check for the termination condition: N=0 and X=0.
    // If this condition is met, stop processing further input lines.
    if (numericLimit === 0 && desiredSum === 0) {
        return false; // Signal to the 'every' method to stop iteration.
    }

    // Call the dedicated function to perform the combinatorial calculation.
    const resultantCount = calculateCombinations(numericLimit, desiredSum);

    // Output the calculated count to the console.
    // console.log returns undefined, so `!console.log` yields `true`.
    // This maintains the original behavior where a non-termination line
    // effectively returns true to the `every` method after printing.
    console.log(resultantCount);
    return true; 
}

// Main execution block:
// Retrieve all input lines and then process each one sequentially.
// The `every` method ensures that processing stops if `processInputRow`
// returns `false` (which happens for the 0 0 termination case).
const allInputLines = acquireDataStream();
allInputLines.every(processInputRow);