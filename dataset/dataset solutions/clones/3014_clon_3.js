'use strict';

// A sufficiently large negative number to represent negative infinity for sums.
const NEGATIVE_SUM_FLOOR = 900719925474099; // Derived from Math.floor(Number.MAX_SAFE_INTEGER / 10)

/**
 * Parses a space-separated string of numbers into an array of integers.
 * @param {string} numberString - The string containing numbers.
 * @returns {number[]} An array of parsed integers.
 */
const parseIntegerArray = (numberString) => {
    return numberString.split(' ').map(Number);
};

/**
 * Calculates the maximum possible sum by strategically flipping segments of an array.
 * This function implements a dynamic programming approach.
 * @param {string} rawInputString - The raw input string from stdin.
 */
function computeOptimalSum(rawInputString) {
    const inputLines = rawInputString.trim().split('\n');
    const totalElements = parseInt(inputLines[0], 10); // Explicit radix for parseInt

    // Prepend '0' to the array string to handle 1-based indexing in the problem logic
    // and ensure numericData[0] is a dummy value, matching the original's behavior.
    const initialDataString = '0 ' + inputLines[1];
    const numericData = parseIntegerArray(initialDataString);

    // DP state definitions using constants for clarity
    const STATE_NOT_FLIPPED = 0; // Represents the state where the current segment is NOT flipped
    const STATE_FLIPPED = 1;     // Represents the state where the current segment IS flipped

    // Initialize DP table: memoTable[i][state] stores the max sum up to index i with 'state'
    // The size is totalElements + 5 to provide sufficient buffer, as in the original.
    const memoTable = Array.from({ length: totalElements + 5 }, () => new Array(2).fill(0));

    // Base cases for DP:
    // At index 0, the sum is 0 if not flipped.
    memoTable[0][STATE_NOT_FLIPPED] = 0;
    // At index 0, the sum is effectively negative infinity if flipped (not a valid starting state).
    memoTable[0][STATE_FLIPPED] = -NEGATIVE_SUM_FLOOR;

    // Iterate through the elements from 1 to totalElements to fill the DP table
    for (let currentElementIndex = 1; currentElementIndex <= totalElements; currentElementIndex++) {
        const previousIndex = currentElementIndex - 1;
        const currentElementValue = numericData[currentElementIndex];

        // Retrieve previous DP states for calculations
        const sumBeforeNotFlipped = memoTable[previousIndex][STATE_NOT_FLIPPED];
        const sumBeforeFlipped = memoTable[previousIndex][STATE_FLIPPED];

        // --- Calculate for STATE_NOT_FLIPPED (current segment is NOT flipped) ---
        // Option A: The previous segment was NOT flipped, and we add the current element normally.
        const pathA_notFlipped = sumBeforeNotFlipped + currentElementValue;
        // Option B: The previous segment WAS flipped, and we "un-flip" it by subtracting the current element.
        const pathB_notFlipped = sumBeforeFlipped - currentElementValue;
        // The maximum sum for the current index in the NOT_FLIPPED state.
        memoTable[currentElementIndex][STATE_NOT_FLIPPED] = Math.max(pathA_notFlipped, pathB_notFlipped);

        // --- Calculate for STATE_FLIPPED (current segment IS flipped) ---
        // Option C: The previous segment was NOT flipped, and we "flip" it by subtracting the current element.
        const pathC_flipped = sumBeforeNotFlipped - currentElementValue;
        // Option D: The previous segment WAS flipped, and we continue the flip by adding the current element normally.
        const pathD_flipped = sumBeforeFlipped + currentElementValue;
        // The maximum sum for the current index in the FLIPPED state.
        memoTable[currentElementIndex][STATE_FLIPPED] = Math.max(pathC_flipped, pathD_flipped);
    }

    // The final answer is the maximum sum when the last segment (up to totalElements) is NOT flipped.
    console.log(memoTable[totalElements][STATE_NOT_FLIPPED]);
}

// Execute the main function with input from stdin
computeOptimalSum(require("fs").readFileSync("/dev/stdin", "utf8"));
