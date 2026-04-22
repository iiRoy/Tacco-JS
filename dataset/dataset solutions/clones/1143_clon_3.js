/**
 * This module provides a function to compute the length of the longest increasing subsequence
 * (LIS) within a numerical sequence. It uses a dynamic programming approach with an O(N^2)
 * time complexity. The input format expects the first number to be the count of elements
 * in the actual sequence that follows.
 */

/**
 * Calculates the length of the Longest Increasing Subsequence (LIS) for a given sequence of numbers.
 * The input array is expected to be formatted such that its first element is the count
 * of the subsequent numbers that form the actual sequence.
 *
 * @param {number[]} rawNumericalSeries - An array where the first element is the count,
 *                                       followed by the sequence numbers.
 * @returns {number} The length of the longest increasing subsequence. Returns 0 for invalid or empty input.
 */
function determineSequenceGrowth(rawNumericalSeries) {
    // Input validation: Check if the provided input is a valid array.
    if (!Array.isArray(rawNumericalSeries) || rawNumericalSeries.length === 0) {
        // If the input is not an array or is empty, an LIS cannot be determined.
        // Log an error and return 0, indicating no increasing subsequence.
        console.error("Error: Input must be a non-empty array of numbers.");
        return 0;
    }

    // Extract the count of actual sequence elements from the beginning of the array.
    // The `shift()` method removes the first element from the array and returns it.
    const expectedSequenceLength = rawNumericalSeries.shift();

    // Additional validation: If the expected length is non-positive or if the remaining
    // array is empty, it means there's no actual sequence to process.
    if (expectedSequenceLength <= 0 || rawNumericalSeries.length === 0) {
        // In such cases, the LIS length is 0.
        return 0;
    }

    // Construct the working sequence by prepending a sentinel value (0).
    // This sentinel simplifies the DP calculations:
    // 1. It ensures that any positive number can "start" an increasing subsequence
    //    by extending from the sentinel, resulting in an LIS of length 1.
    // 2. It simplifies the base case for the DP, as `dpLengths[0]` will be 0.
    const processedSequenceWithSentinel = [0, ...rawNumericalSeries];

    // Determine the total number of elements in our processed sequence (including the sentinel).
    const totalElementsInProcessedSequence = processedSequenceWithSentinel.length;

    // dpLengths: An array to store the length of the LIS ending at each index `i`
    // of `processedSequenceWithSentinel`. `dpLengths[i]` will hold the length
    // of the LIS that includes `processedSequenceWithSentinel[i]` as its last element.
    // All values are initialized to 0.
    const dpLengths = Array.from({ length: totalElementsInProcessedSequence }, () => 0);

    // predecessorMap: An array to store the index of the element that immediately precedes
    // the current element in the LIS ending at that current element's index.
    // This array is useful for reconstructing the actual LIS path, though it's not
    // strictly required for just calculating the length.
    // All values are initialized to 0.
    const predecessorMap = Array.from({ length: totalElementsInProcessedSequence }, () => 0);

    // The sentinel element (at index 0) has no predecessor in the actual sequence.
    // We denote this by setting its predecessor index to -1.
    predecessorMap[0] = -1;

    // Main Dynamic Programming Loop:
    // Iterate through the sequence, starting from the first actual number (index 1,
    // as index 0 is occupied by our sentinel).
    for (let currentItemPosition = 1; currentItemPosition < totalElementsInProcessedSequence; ++currentItemPosition) {
        // Initialize the 'optimalPreviousPosition' to the sentinel's index (0).
        // This is the default best previous element to extend from.
        let optimalPreviousPosition = 0;
        const valueAtCurrentPosition = processedSequenceWithSentinel[currentItemPosition];

        // Inner loop: Examine all elements that come before the 'currentItemPosition'.
        // The goal is to find the element 'previousItemPosition' that:
        // 1. Is strictly smaller than 'valueAtCurrentPosition' (to maintain increasing order).
        // 2. Leads to the longest LIS up to 'previousItemPosition'.
        for (let previousItemPosition = 0; previousItemPosition < currentItemPosition; ++previousItemPosition) {
            const valueAtPreviousPosition = processedSequenceWithSentinel[previousItemPosition];

            // Check if the previous element can extend the LIS and if it results
            // in a longer LIS than what we've found so far for 'optimalPreviousPosition'.
            if (valueAtPreviousPosition < valueAtCurrentPosition &&
                dpLengths[previousItemPosition] > dpLengths[optimalPreviousPosition]) {
                optimalPreviousPosition = previousItemPosition;
            }
        }

        // Update the 'dpLengths' array: The LIS ending at 'currentItemPosition'
        // is 1 (for the current element itself) plus the length of the LIS
        // ending at the 'optimalPreviousPosition'.
        dpLengths[currentItemPosition] = dpLengths[optimalPreviousPosition] + 1;

        // Store the predecessor index for potential LIS reconstruction.
        predecessorMap[currentItemPosition] = optimalPreviousPosition;
    }

    // After the DP loops complete, the maximum value found in the 'dpLengths' array
    // represents the length of the overall Longest Increasing Subsequence in the
    // original sequence. The sentinel handling ensures this value is directly correct.
    const finalLongestSequenceLength = Math.max(...dpLengths);

    // Return the computed LIS length.
    return finalLongestSequenceLength;
}

// --- Application Entry Point: Handle Standard Input/Output ---

// Read all input from standard input (/dev/stdin) as a UTF-8 string.
const standardInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string:
// 1. `trim()`: Removes any leading or trailing whitespace (like newlines).
// 2. `split('\n')`: Breaks the string into an array of strings, one for each line.
// 3. `map(Number)`: Converts each string in the array to its numerical equivalent.
// This results in an array of numbers, ready for processing by our function.
const numericalDataFromInput = standardInputBuffer.trim().split('\n').map(Number);

// Invoke the LIS calculation function with the prepared numerical data.
const resultOfLISCalculation = determineSequenceGrowth(numericalDataFromInput);

// Output the final result to standard output.
// `process.stdout.write` is used here, which is often preferred in competitive
// programming contexts for performance or specific output formatting needs.
process.stdout.write(resultOfLISCalculation.toString() + '\n');