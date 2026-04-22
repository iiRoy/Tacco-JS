const fileSystem = require('fs');

// Reads the raw input data from standard input, typically /dev/stdin in competitive programming environments.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Divides the entire input string into an array of individual lines.
const inputDataLines = rawInputData.split('\n');

// A utility function to safely parse a line of space-separated numbers.
// It handles potential empty lines or lines with only whitespace.
const parseNumericLine = (lineContent) => {
    // Validate input to prevent errors from empty or malformed lines.
    if (!lineContent || lineContent.trim() === '') {
        return []; // Returns an empty array if the line is not valid for parsing numbers.
    }
    // Trims whitespace, splits by space, and converts each part to a number.
    return lineContent.trim().split(' ').map(Number);
};

// Maintains the current position within the `inputDataLines` array.
let currentLinePointer = 0;

// Retrieves the next line from the input and advances the line pointer.
const retrieveNextInputLine = () => {
    // Basic bounds check to prevent reading past the end of available lines.
    if (currentLinePointer >= inputDataLines.length) {
        // In a real application, this might throw an error or log a warning.
        console.warn("Attempted to read beyond available input lines.");
        return ''; // Return an empty string as a fallback.
    }
    const lineContent = inputDataLines[currentLinePointer];
    currentLinePointer++; // Move to the next line for the subsequent read.
    return lineContent;
};

// Parses the first line to get the count of elements for the primary array.
const mainArrayElementCount = Number(retrieveNextInputLine());

// Parses the second line to get the primary array of candidate numbers.
const candidateNumbersCollection = parseNumericLine(retrieveNextInputLine());

// Parses the third line to get the total number of sum queries.
const totalSumQueries = Number(retrieveNextInputLine());

// Parses the fourth line to get the array of target sums for the queries.
const targetSumsForQueries = parseNumericLine(retrieveNextInputLine());

// --- Core Algorithm: Recursive Subset Sum Checker ---

/**
 * Recursively checks if a subset of `candidateNumbersCollection` (starting from `currentElementIndex`)
 * can sum up to the `targetRemainingSum`.
 * This function explores two possibilities for each number: either include it in the sum or exclude it.
 *
 * @param {number} currentElementIndex - The index of the current element in `candidateNumbersCollection` being considered.
 * @param {number} targetRemainingSum - The sum that still needs to be achieved.
 * @returns {boolean} `true` if a subset is found that sums to `targetRemainingSum`, `false` otherwise.
 */
function findSubsetThatSums(currentElementIndex, targetRemainingSum) {
    // Early exit condition: If the target sum is exactly zero, we have found a valid subset.
    if (targetRemainingSum === 0) {
        return true;
    }

    // Base cases for recursion termination:
    // 1. If we have processed all elements in the `candidateNumbersCollection`.
    // 2. If the `targetRemainingSum` has become negative, meaning we've overshot the target.
    if (currentElementIndex >= mainArrayElementCount || targetRemainingSum < 0) {
        return false;
    }

    // Capture the value of the current candidate number for clarity.
    const currentCandidateValue = candidateNumbersCollection[currentElementIndex];

    // Recursive call 1: Explore the path where the current number IS INCLUDED in the sum.
    // We move to the next element and subtract the current number's value from the target.
    const pathWithInclusion = findSubsetThatSums(currentElementIndex + 1, targetRemainingSum - currentCandidateValue);

    // Recursive call 2: Explore the path where the current number IS EXCLUDED from the sum.
    // We move to the next element, but the target sum remains unchanged.
    const pathWithoutInclusion = findSubsetThatSums(currentElementIndex + 1, targetRemainingSum);

    // If either of the paths (including or excluding the current number) leads to a solution,
    // then a solution exists for the current state.
    return pathWithInclusion || pathWithoutInclusion;
}

// --- Processing Queries and Displaying Results ---

// Iterate through each target sum specified in the `targetSumsForQueries` array.
for (const queryTargetValue of targetSumsForQueries) {
    // Execute the subset sum check for the current query target.
    const isSumPossible = findSubsetThatSums(0, queryTargetValue);

    // Output the result string based on the boolean outcome.
    if (isSumPossible) {
        console.log('yes');
    } else {
        console.log('no');
    }
}