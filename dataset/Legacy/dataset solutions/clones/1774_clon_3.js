// This module provides file system capabilities, allowing interaction with the file system.
const fileSystemModule = require('fs');

// Read all raw input data from standard input.
// The data is expected to be encoded in UTF-8.
// The first line contains two space-separated integers: the target value and the count of forbidden numbers.
// The second line (if N > 0) contains N space-separated integers: the forbidden numbers themselves.
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Split the entire input string into an array of individual lines.
// This regex handles both Windows (CRLF) and Unix (LF) line endings gracefully.
const inputLines = rawInputData.split(/\r?\n/);

// Parse the first line to extract the target value and the number of forbidden values.
const firstLineTokens = inputLines[0].split(' ');
const targetNumericValue = parseInt(firstLineTokens[0], 10);
const numForbiddenNumbers = parseInt(firstLineTokens[1], 10);

// Robustness check: Ensure that the parsed values are indeed numbers.
// If parsing fails (e.g., due to malformed input), an error message is printed and the script exits.
if (isNaN(targetNumericValue) || isNaN(numForbiddenNumbers)) {
    console.error("Input data error: Expected two integers on the first line.");
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// Early exit condition: If there are no forbidden numbers, the target value itself is the closest allowed.
// This is a guard clause to handle a simple, common case efficiently.
if (numForbiddenNumbers === 0) {
    console.log(targetNumericValue);
    return; // Terminate script execution after printing the result.
}

// Process the second line of input, which contains the list of forbidden numbers.
// We'll store these in a Set data structure for highly efficient O(1) average-time lookups.
const forbiddenNumberStrings = inputLines[1].split(' ');
const forbiddenValuesSet = new Set();

// Iterate through the string representations of forbidden numbers and convert them to integers.
// Only valid integers are added to the set.
for (let idx = 0; idx < numForbiddenNumbers; idx++) {
    const parsedForbiddenVal = parseInt(forbiddenNumberStrings[idx], 10);
    // Add only if it's a valid number. This prevents issues with empty strings or non-numeric input.
    if (!isNaN(parsedForbiddenVal)) {
        forbiddenValuesSet.add(parsedForbiddenVal);
    }
}

// Initialize variables to keep track of the best candidate found so far.
// `closestPermittedValue` will store the number that is closest to `targetNumericValue` and is not forbidden.
// `minimumAbsoluteDifference` will store the absolute difference between `closestPermittedValue` and `targetNumericValue`.
let closestPermittedValue = null;
let minimumAbsoluteDifference = Infinity; // Initialize with a very large value to ensure the first valid candidate is chosen.

// Iterate through a predefined range of numbers, from 100 down to -10 (inclusive).
// The descending order of iteration is important for correctly replicating the original's tie-breaking logic.
for (let currentCandidate = 100; currentCandidate >= -10; currentCandidate--) {
    // Check if the current number in the iteration is among the forbidden values.
    // Using a Set makes this check very fast.
    const isForbidden = forbiddenValuesSet.has(currentCandidate);

    // If the current candidate number is NOT forbidden, evaluate its proximity to the target.
    if (!isForbidden) {
        // Calculate the absolute difference between the candidate and the target value.
        const currentDifference = Math.abs(currentCandidate - targetNumericValue);

        // If this candidate is strictly closer to the target than any previous best candidate,
        // update the best candidate and the minimum difference.
        if (currentDifference < minimumAbsoluteDifference) {
            minimumAbsoluteDifference = currentDifference;
            closestPermittedValue = currentCandidate;
        }
        // If this candidate has the same absolute difference as the current best,
        // we apply the original code's tie-breaking rule:
        // If distances are equal, the smaller number is preferred.
        // This is achieved because the loop iterates downwards; if a smaller `currentCandidate`
        // has the same distance, it will replace the current `closestPermittedValue`.
        else if (currentDifference === minimumAbsoluteDifference) {
            // This condition explicitly ensures that if a tie occurs, and the current candidate
            // is smaller than the already stored `closestPermittedValue`, it becomes the new best.
            // `closestPermittedValue === null` covers the very first assignment if the first found
            // number happens to be tied with another (less likely given `Infinity` init, but robust).
            if (closestPermittedValue === null || currentCandidate < closestPermittedValue) {
                closestPermittedValue = currentCandidate;
            }
        }
    }
}

// After iterating through all possible candidates, print the closest allowed value found.
// A final check for null in case no permitted value was found in the range (highly unlikely for this problem).
if (closestPermittedValue !== null) {
    console.log(closestPermittedValue);
} else {
    console.error("Algorithm error: No permitted value could be identified within the defined search range.");
    process.exit(1); // Indicate an unexpected error state.
}