/*
 * This program calculates the count of specific "lucky" numbers
 * up to a given upper limit. A number is considered lucky if
 * it is composed solely of digits 3, 5, and 7, and contains
 * at least one instance of each of these three digits.
 * The calculation is performed using a recursive depth-first search approach.
 */

/**
 * Recursively counts the lucky numbers satisfying the criteria.
 *
 * @param {number} currentDepth - The current recursion depth, used to determine the power of 10 for building new numbers.
 * @param {number} candidateValue - The number currently being evaluated and extended.
 * @param {number} limitVal - The maximum allowed value for a lucky number.
 * @returns {number} The total count of lucky numbers found in this branch of the recursion.
 */
function countValidPermutations(currentDepth, candidateValue, limitVal) {
    // Guard clause: If the current number exceeds the limit, it cannot be a lucky number
    // nor can any number formed by extending it. So, return 0 for this branch.
    if (candidateValue > limitVal) {
        return 0;
    }

    let currentBranchSum = 0; // Accumulator for the current recursive branch's valid numbers.

    // Step 1: Check if the current candidateValue itself is a lucky number.
    // We need to determine if it contains digits 3, 5, and 7.
    const presentDigits = new Set();
    let numberToScan = candidateValue;

    // Iterate through each digit of the numberToScan.
    while (numberToScan > 0) {
        const digit = numberToScan % 10; // Get the last digit.
        // If the digit is one of our target digits (3, 5, or 7), add it to our set.
        if (digit === 3 || digit === 5 || digit === 7) {
            presentDigits.add(digit);
        }
        // Optimization: If all three required digits are found, no need to check further.
        if (presentDigits.size === 3) {
            break;
        }
        // Move to the next digit by integer division.
        numberToScan = (numberToScan / 10) | 0; // Using bitwise OR for floor, a common JS idiom.
    }

    // If the set of present digits contains all three (3, 5, 7), then candidateValue is a lucky number.
    if (presentDigits.has(3) && presentDigits.has(5) && presentDigits.has(7)) {
        currentBranchSum = 1; // Mark this number as one valid count.
    }

    // Step 2: Recursively generate and count lucky numbers by appending 3, 5, or 7
    // to the left of the current candidateValue.
    // Calculate the power of 10 required to place the new digit.
    const nextPowerOfTen = Math.pow(10, currentDepth);

    // Recursive call for appending '3'
    currentBranchSum += countValidPermutations(
        currentDepth + 1,
        nextPowerOfTen * 3 + candidateValue, // New number: (3 * 10^currentDepth) + candidateValue
        limitVal
    );

    // Recursive call for appending '5'
    currentBranchSum += countValidPermutations(
        currentDepth + 1,
        nextPowerOfTen * 5 + candidateValue, // New number: (5 * 10^currentDepth) + candidateValue
        limitVal
    );

    // Recursive call for appending '7'
    currentBranchSum += countValidPermutations(
        currentDepth + 1,
        nextPowerOfTen * 7 + candidateValue, // New number: (7 * 10^currentDepth) + candidateValue
        limitVal
    );

    return currentBranchSum; // Return the total count for this branch.
}

/**
 * Main function to process input and initiate the lucky number counting.
 *
 * @param {string} rawData - The raw input string containing the upper limit N.
 */
function processInputAndCompute(rawData) {
    // Parse the input string into an integer, which represents the upper bound.
    const limitVal = parseInt(rawData, 10);

    // Input validation: Ensure the limit is a positive number.
    // If not, print 0 as no lucky numbers can exist.
    if (isNaN(limitVal) || limitVal <= 0) {
        console.log(0);
        return;
    }

    let finalOverallCount = 0; // Global accumulator for the total lucky numbers.

    // Start the recursive counting process.
    // Initial calls are made for numbers starting with 3, 5, and 7.
    // currentDepth starts at 1 because we are conceptually adding a digit
    // to a single-digit number (3, 5, or 7) to form a two-digit number,
    // e.g., for '3', next numbers are 33, 35, 37.
    finalOverallCount += countValidPermutations(1, 3, limitVal);
    finalOverallCount += countValidPermutations(1, 5, limitVal);
    finalOverallCount += countValidPermutations(1, 7, limitVal);

    // Output the final computed count.
    console.log(finalOverallCount);
}

// The following lines handle standard input/output.
// This section reads input from /dev/stdin and passes it to the main processing function.
// Please do not modify the code below this line.
processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));