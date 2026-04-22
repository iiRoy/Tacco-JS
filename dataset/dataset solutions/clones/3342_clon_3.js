'use strict'; // Enforce strict mode for cleaner code

/**
 * Computes the sum of elements within a specified range using a pre-calculated array of cumulative sums.
 * This approach allows for O(1) range sum queries after an initial O(N) pre-calculation.
 *
 * @param {number} startIndex - The zero-based starting index of the desired segment (inclusive).
 * @param {number} endIndex - The zero-based ending index of the desired segment (inclusive).
 * @param {number[]} cumulativeSums - An array where `cumulativeSums[i]` stores the sum of elements from index 0 to `i`
 *                                    of the original array.
 * @returns {number} The sum of numbers from `startIndex` to `endIndex` in the original sequence.
 */
function obtainSegmentSum(startIndex, endIndex, cumulativeSums) {
    // Add a quick check for potentially invalid index ranges.
    // While the calling function should ideally ensure validity, this adds robustness.
    if (startIndex < 0 || endIndex >= cumulativeSums.length || startIndex > endIndex) {
        // In a competitive programming context, such errors might not be explicitly handled,
        // but for a robust solution, one might throw an error or return a specific value.
        // For this clone, we'll return 0, assuming valid ranges are expected based on problem constraints.
        return 0;
    }

    // If the segment begins at the very first element (index 0),
    // its sum is simply the cumulative sum up to the end index.
    if (startIndex === 0) {
        return cumulativeSums[endIndex];
    }

    // For any other starting index, the sum of the segment [startIndex, endIndex]
    // is obtained by subtracting the cumulative sum up to (startIndex - 1)
    // from the cumulative sum up to endIndex.
    const sumBeforeStart = cumulativeSums[startIndex - 1];
    return cumulativeSums[endIndex] - sumBeforeStart;
}

/**
 * Generates an array of cumulative (prefix) sums from a given array of numbers.
 * The cumulative sum at each position `i` is the sum of all elements from index 0 up to `i` (inclusive).
 *
 * @param {number[]} sourceArray - The original array of numeric values.
 * @returns {number[]} An array containing the cumulative sums. Returns an empty array if input is invalid.
 */
function buildCumulativeArray(sourceArray) {
    // Validate input array to prevent errors.
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
        return []; // Return an empty array for invalid input.
    }

    const dataLength = sourceArray.length;
    // Initialize the array for cumulative sums. Pre-allocating can be slightly more efficient.
    const cumulativeData = new Array(dataLength);

    // The first element of the cumulative sum array is identical to the first element of the source array.
    cumulativeData[0] = sourceArray[0];

    // Iterate through the rest of the source array, calculating each cumulative sum
    // by adding the current element to the previous cumulative sum.
    for (let currentIdx = 1; currentIdx < dataLength; ++currentIdx) {
        cumulativeData[currentIdx] = cumulativeData[currentIdx - 1] + sourceArray[currentIdx];
    }

    return cumulativeData;
}

/**
 * Computes the minimum cost to partition a sequence of numbers using dynamic programming.
 * This problem structure is characteristic of problems like optimal binary search tree construction
 * or matrix chain multiplication, where the cost of a subproblem often involves the sum of elements
 * within that subproblem's range.
 *
 * @param {number} arraySize - The total number of elements in the sequence.
 * @param {number[]} inputValues - The array containing the numeric values of the sequence.
 * @returns {number} The minimum total cost for partitioning the entire sequence. Returns -1 on input error.
 */
function determineOptimalPartitionCost(arraySize, inputValues) {
    // Perform initial validation of the input parameters.
    if (arraySize <= 0 || !Array.isArray(inputValues) || inputValues.length !== arraySize) {
        console.error("Validation Error: Input array size or values are invalid.");
        return -1; // Indicate a failure or invalid input.
    }

    // Define a very large number to represent infinity for minimum cost calculations.
    // Using Number.MAX_SAFE_INTEGER is a good practice for preventing overflow with typical DP sums.
    const MAX_POSSIBLE_COST = Number.MAX_SAFE_INTEGER;

    // Initialize a 2D array (memoization table) to store the minimum costs for subproblems.
    // `memoizationTable[i][j]` will store the minimum cost to partition the segment from index `i` to `j`.
    // Fill all cells with MAX_POSSIBLE_COST initially.
    const memoizationTable = Array.from({ length: arraySize },
        () => Array(arraySize).fill(MAX_POSSIBLE_COST)
    );

    // Base case: The cost of partitioning a segment of a single element is always zero.
    // This initializes the diagonal of the DP table.
    for (let i = 0; i < arraySize; ++i) {
        memoizationTable[i][i] = 0;
    }

    // Pre-calculate cumulative sums for efficient retrieval of segment sums.
    const prefixSums = buildCumulativeArray(inputValues);

    // Iterate through segment lengths (or 'gaps') from 2 up to the total array size.
    // A segment length of 'len' means we are considering subproblems of `len` elements.
    for (let segmentLength = 2; segmentLength <= arraySize; ++segmentLength) {
        // Iterate through all possible starting indices for segments of the current `segmentLength`.
        for (let segmentStart = 0; segmentStart <= arraySize - segmentLength; ++segmentStart) {
            // Calculate the corresponding end index for the current segment.
            const segmentEnd = segmentStart + segmentLength - 1;

            // For each segment [segmentStart, segmentEnd], try every possible split point 'splitPoint'.
            // The split point divides the segment into two sub-segments: [segmentStart, splitPoint] and [splitPoint + 1, segmentEnd].
            for (let splitPoint = segmentStart; splitPoint < segmentEnd; ++splitPoint) {
                // Retrieve the pre-computed minimum costs for the two sub-problems.
                const costOfLeftSubproblem = memoizationTable[segmentStart][splitPoint];
                const costOfRightSubproblem = memoizationTable[splitPoint + 1][segmentEnd];

                // Calculate the sum of elements within the left sub-segment.
                const sumOfLeftSegment = obtainSegmentSum(segmentStart, splitPoint, prefixSums);
                // Calculate the sum of elements within the right sub-segment.
                const sumOfRightSegment = obtainSegmentSum(splitPoint + 1, segmentEnd, prefixSums);

                // The total cost for this particular split is the sum of:
                // 1. Cost of the left sub-problem.
                // 2. Cost of the right sub-problem.
                // 3. Sum of elements in the left sub-segment (often a merge/combination cost).
                // 4. Sum of elements in the right sub-segment (often another merge/combination cost).
                const currentSplitTotalCost = costOfLeftSubproblem + costOfRightSubproblem + sumOfLeftSegment + sumOfRightSegment;

                // Update the minimum cost for the current segment [segmentStart, segmentEnd]
                // if the current split yields a lower total cost than previously found.
                memoizationTable[segmentStart][segmentEnd] = Math.min(memoizationTable[segmentStart][segmentEnd], currentSplitTotalCost);
            }
        }
    }

    // The final answer, the minimum cost for the entire sequence, is found at
    // memoizationTable[0][arraySize - 1].
    return memoizationTable[0][arraySize - 1];
}

/**
 * The primary execution function that handles reading input, parsing it,
 * invoking the core algorithm, and displaying the computed result.
 *
 * @param {string} rawData - The raw string input, typically read from standard input.
 */
function processInputAndDisplayResult(rawData) {
    // Trim leading/trailing whitespace and split the input into individual lines.
    const inputLines = rawData.trim().split('\n');

    // Basic validation: ensure there are enough lines of input.
    if (inputLines.length < 2) {
        console.error("Input Error: Not enough lines provided. Expected at least 2 lines.");
        return; // Exit if input is insufficient.
    }

    // Parse the first line to get the array size (N).
    const dataSizeStr = inputLines[0].trim();
    const dataSize = parseInt(dataSizeStr, 10);

    // Validate the parsed array size.
    if (isNaN(dataSize) || dataSize <= 0) {
        console.error(`Input Error: Invalid or non-positive array size provided: "${dataSizeStr}".`);
        return;
    }

    // Parse the second line to get the array of numbers.
    const numericDataStr = inputLines[1].trim();
    const numericData = numericDataStr.split(' ').map(val => parseInt(val.trim(), 10));

    // Validate if all elements in the array were successfully parsed as numbers.
    if (numericData.some(isNaN)) {
        console.error(`Input Error: One or more elements in the input array are not valid numbers: "${numericDataStr}".`);
        return;
    }

    // Validate if the actual number of elements matches the declared array size.
    if (numericData.length !== dataSize) {
        console.error(`Input Error: Declared array size N (${dataSize}) does not match the actual number of elements (${numericData.length}).`);
        return;
    }
    
    // Execute the core dynamic programming algorithm to find the optimal partition cost.
    const finalOutcome = determineOptimalPartitionCost(dataSize, numericData);

    // Output the final calculated result to the console.
    console.log(finalOutcome);
}

// Entry point of the program.
// This block handles reading input from stdin (standard input) in a Node.js environment.
try {
    // Read the entire content of /dev/stdin as a UTF-8 string.
    const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Pass the raw input content to the processing function.
    processInputAndDisplayResult(standardInputContent);
} catch (error) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error("Runtime Error: Could not read input from /dev/stdin or encountered an issue:", error.message);
    // In a production system, more sophisticated error handling or logging would be implemented here.
}