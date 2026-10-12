// This module provides a solution for finding combinations of digits that sum to a specific target.

function computeSumCombinations(currentSum, startDigit, numDigits, targetSum, currentDepth) {
    // Check if we have placed all required digits.
    if (numDigits - 1 === currentDepth) {
        // If the last digit needed (targetSum - currentSum) is within the valid range [startDigit, 9],
        // then this is a valid combination.
        if (startDigit <= targetSum - currentSum && targetSum - currentSum <= 9) {
            return 1; // One valid way found.
        }
        return 0; // No valid way for the last digit.
    }

    let totalWays = 0; // Initialize counter for valid combinations.
    // Iterate through possible digits for the current position.
    for (let digitVal = startDigit; digitVal <= 9; digitVal++) {
        // If adding the current digit exceeds the target sum,
        // then any subsequent larger digits will also exceed it, so we can stop.
        if (currentSum + digitVal > targetSum) {
            break;
        }
        // Recursively call the function with the updated sum, next starting digit, and increased depth.
        totalWays += computeSumCombinations(currentSum + digitVal, digitVal + 1, numDigits, targetSum, currentDepth + 1);
    }
    return totalWays; // Return the accumulated count of ways.
}

// This function processes each line of input data.
const processInputLines = function(rawData) {
    rawData.trim().split('\n').forEach(function(inputLine) {
        const parts = inputLine.split(' '); // Split the line into number of digits and target sum.
        const countDigits = parts[0];
        const desiredSum = parts[1];

        // If both countDigits and desiredSum are '0', it's a termination signal.
        if (countDigits === '0' && desiredSum === '0') {
            return; // Stop processing further input lines.
        }

        // Convert string values to numbers and call the core calculation function.
        // The initial sum is 0, starting digit is 0, and current depth is 0.
        console.log(computeSumCombinations(0, 0, +countDigits, +desiredSum, 0));
    });
};

// This utility function handles reading input from standard input.
function InputHandler(callbackFunction) {
    let receivedData = ''; // Buffer to store all incoming data chunks.

    process.stdin.resume(); // Ensure the standard input stream remains open.
    process.stdin.setEncoding('utf8'); // Set the character encoding for input.

    // Event listener for when data chunks are received.
    process.stdin.on('data', function(chunk) {
        receivedData += chunk; // Append the new chunk to the data buffer.
    });

    // Event listener for when the input stream ends.
    process.stdin.on('end', function() {
        callbackFunction(receivedData); // Execute the provided callback with all collected input data.
    });
}

// Initiate the input handling process by passing our main processing logic.
InputHandler(processInputLines);
