/*
 * This module calculates the length of the Longest Increasing Subsequence (LIS)
 * for a sequence of numbers provided via standard input.
 *
 * The implementation utilizes a dynamic programming approach with O(N^2) time complexity.
 * It stores the length of the LIS ending at each position and predecessor pointers.
 *
 * NOTE: The input processing and LIS calculation logic is designed to
 * replicate the specific behavior of the original code, including
 * a peculiar modification of the input sequence's first element.
 */

/**
 * Processes the raw input string to extract numeric data.
 * @param {string} rawInput The raw string content read from standard input.
 * @returns {number[]} An array of numbers parsed from the input.
 */
const parseNumericSequenceInput = (rawInput) => {
    // Remove leading/trailing whitespace, then split by newlines,
    // and finally convert each line to a number.
    return rawInput.trim().split("\n").map(Number);
};

/**
 * Computes the length of the Longest Increasing Subsequence (LIS)
 * based on the globally accessible `numericSequenceData` array.
 *
 * The function modifies `numericSequenceData[0]` to `0` as part of its internal logic.
 * It then calculates the LIS for the remaining elements, considering `numericSequenceData[0]`
 * (now `0`) as a potential starting point for subsequences.
 */
const calculateOptimalSequenceLength = () => {
    // Basic validation: Ensure we have at least one element to process.
    // The original code implies T.length >= 1 for the main loop to run.
    if (!numericSequenceData || numericSequenceData.length < 1) {
        console.error("Error: Input sequence data is empty or invalid.");
        return; // Exit if no data
    }

    // Determine the effective size for our auxiliary arrays.
    // This size is derived from the first element of the input data, plus one.
    // This implies numericSequenceData[0] might represent a count or a size indicator.
    const allocatedArraySize = numericSequenceData[0] + 1;

    // Initialize arrays to store LIS lengths and predecessor indices.
    // `currentLengths[idx]` will store the length of the LIS ending at `numericSequenceData[idx]`.
    // `predecessorMap[idx]` will store the index of the element preceding `numericSequenceData[idx]` in its LIS.
    // Both arrays are filled with zeros initially.
    const currentLengths = new Array(allocatedArraySize).fill(0);
    const predecessorMap = new Array(allocatedArraySize).fill(0);

    // CRITICAL ORIGINAL BEHAVIOR: Overwrite the first element of the input array to 0.
    // This changes the sequence being analyzed and impacts LIS calculation,
    // as `numericSequenceData[0]` (now 0) can participate in comparisons.
    numericSequenceData[0] = 0;

    // Main loop: Iterate through the elements of the sequence starting from the second element (index 1).
    // The loop processes up to the last element of the input data.
    for (let outerIndex = 1; outerIndex < numericSequenceData.length; outerIndex++) {
        // Initialize the best predecessor candidate for the current outerIndex.
        // By default, it's considered to be at index 0.
        let bestPreviousCandidate = 0;

        // Store the value of the current element being processed for clarity.
        const currentElementValue = numericSequenceData[outerIndex];

        // Inner loop: Scan all elements preceding the current `outerIndex`.
        // This includes `numericSequenceData[0]` (which is now 0).
        for (let innerScanIndex = 0; innerScanIndex <= outerIndex - 1; innerScanIndex++) {
            // Store the value of the previous element being compared.
            const previousElementValue = numericSequenceData[innerScanIndex];

            // Check two conditions for a potential predecessor:
            // 1. The previous element's value must be strictly less than the current element's value
            //    to maintain an increasing subsequence.
            // 2. The LIS length ending at the previous element (`currentLengths[innerScanIndex]`)
            //    must be greater than the LIS length ending at our current best candidate (`currentLengths[bestPreviousCandidate]`).
            //    This helps us find the *longest* possible LIS ending before `outerIndex`.
            const isIncreasing = previousElementValue < currentElementValue;
            const isLongerSubsequence = currentLengths[innerScanIndex] > currentLengths[bestPreviousCandidate];

            if (isIncreasing && isLongerSubsequence) {
                // If both conditions are met, update our best predecessor candidate.
                bestPreviousCandidate = innerScanIndex;
            }
        }

        // After checking all preceding elements, calculate the LIS length for the current `outerIndex`.
        // It's one more than the LIS length of its best predecessor.
        currentLengths[outerIndex] = currentLengths[bestPreviousCandidate] + 1;

        // Record the predecessor for potential reconstruction of the subsequence (though not used in this output).
        predecessorMap[outerIndex] = bestPreviousCandidate;
    }

    // Find the maximum value in the `currentLengths` array.
    // This represents the overall length of the Longest Increasing Subsequence.
    // Using spread operator for Math.max is a modern equivalent to `apply`.
    const overallMaximumLength = Math.max(...currentLengths);

    // Output the calculated maximum LIS length to the console.
    console.log(`Calculated LIS Length: ${overallMaximumLength}`);
};

// --- Program Execution Start ---

// Read the entire standard input as a UTF-8 string.
// This is typical for competitive programming environments like `/dev/stdin`.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the raw input into our global numeric sequence array.
// This array will be directly accessed and modified by `calculateOptimalSequenceLength`.
let numericSequenceData = parseNumericSequenceInput(rawInputContent);

// Invoke the LIS calculation function.
calculateOptimalSequenceLength();

// --- Program Execution End ---