(function (rawData) {
    // This immediately invoked function expression (IIFE) processes input data.
    // It reads from standard input, parses it, and then solves multiple test cases.

    // First, clean up the raw input string: remove any trailing newline characters
    // and then split the entire string into an array of individual lines.
    let processedLines = rawData.trimEnd().split('\n');

    // Enter an infinite loop to process each test case.
    // The loop will terminate when a specific condition (0 0 input) is met.
    while ( true ) {
        // Retrieve the very first line from our processed array,
        // split it by spaces to get individual string components,
        // and then convert each component string into an integer.
        let numericValues = processedLines.shift().split(' ').map(val => parseInt(val, 10));

        // Extract the first number from the parsed array, representing the quantity of digits.
        let numDigits = numericValues.shift();
        // Extract the second number, which is the target sum we aim to achieve.
        let targetSum = numericValues.shift();

        // This is our crucial termination condition for the processing loop.
        // If both the number of digits and the target sum are zero, we are done.
        if (numDigits === 0 && targetSum === 0) {
            // Exit the entire IIFE, ceasing further input processing.
            return;
        }

        // If the termination condition is not met, calculate the combinations
        // for the current set of 'numDigits' and 'targetSum'.
        // The result is then printed to the console.
        console.log(determineWays(numDigits, targetSum));
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Execute the IIFE by reading the entire content of /dev/stdin as UTF-8.


/**
 * Function to initiate the calculation of unique digit combinations.
 * This acts as the public-facing entry point for finding combinations.
 *
 * @param {number} count - The exact number of distinct digits (from 0-9) that must be chosen.
 * @param {number} target - The precise sum that these 'count' digits must add up to.
 * @returns {number} The total quantity of valid combinations that satisfy the criteria.
 */
function determineWays(count, target) {
    // Delegate the actual recursive work to a helper function.
    // We start searching for combinations beginning with the digit 0.
    return exploreSums(0, count, target);
}

/**
 * Recursive helper function that explores all possible combinations of digits.
 * It systematically tries to build sums using distinct digits in an ascending order.
 *
 * @param {number} currentDigitStart - The smallest digit value that can be considered
 *                                     for the current position in the combination.
 *                                     Ensures digits are unique and in increasing order.
 * @param {number} remainingDigits - The number of digits that still need to be selected
 *                                   to form a complete combination.
 * @param {number} currentTargetSum - The remaining sum that needs to be achieved
 *                                    by the 'remainingDigits'.
 * @returns {number} The count of successful combinations found through this particular
 *                   recursive branch.
 */
function exploreSums(currentDigitStart, remainingDigits, currentTargetSum) {
    let comboCounter = 0; // Initialize a local counter for combinations found in this call.

    // Loop through all possible digit values starting from 'currentDigitStart' up to 9.
    // This ensures that each digit is considered only once and in an increasing sequence.
    for (let digitValue = currentDigitStart; digitValue < 10; digitValue++) {
        // Calculate the new target sum after including the current 'digitValue'.
        let updatedTargetSum = currentTargetSum - digitValue;

        // Base case for the recursion: If only one digit remains to be chosen.
        if (remainingDigits === 1) {
            // If the 'updatedTargetSum' is exactly zero, it means we have found
            // a valid combination using the specified number of digits.
            if (updatedTargetSum === 0) {
                comboCounter++; // Increment the counter for this valid combination.
            }
        } else {
            // Recursive case: If more than one digit still needs to be chosen.
            // Make a recursive call:
            // - The next digit must be greater than 'digitValue' (i.e., 'digitValue + 1').
            // - One less digit needs to be chosen ('remainingDigits - 1').
            // - The target sum is now 'updatedTargetSum'.
            // Add the results from this recursive call to our total 'comboCounter'.
            comboCounter += exploreSums(digitValue + 1, remainingDigits - 1, updatedTargetSum);
        }
    }

    // After trying all possible digit values for the current position,
    // return the total count of combinations found by this function call.
    return comboCounter;
}