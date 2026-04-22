const fileSystemModule = require("fs");

// Define constants for specific array indices and counts used in the algorithm.
// These magic numbers from the original code are made explicit for clarity
// and easier maintenance.
const EXPECTED_MINIMUM_INPUT_LENGTH = 12; // Required for j[11] to be accessible
const CUMULATIVE_SUM_CALCULATION_COUNT = 10; // Corresponds to `n=10` in original's first loop (j[0]...j[9])
const THRESHOLD_DIVISOR_ELEMENT_INDEX = 11; // Index for the element used in the 'a' component (original j[11])
const THRESHOLD_BASE_ELEMENT_INDEX = 10; // Index for the element used in the `j[n]` component (original j[10] when n=10)

/**
 * Processes a single line of input data to calculate a specific index based on
 * cumulative sums and a derived threshold.
 *
 * This function encapsulates the core logic of the original one-liner,
 * making it more readable, robust, and extensible.
 *
 * @param {string} inputLine - A comma-separated string of numeric values.
 * @returns {number | null} The calculated index, or null if an error occurred
 *                          during processing (e.g., insufficient data, division by zero).
 */
function determineCalculatedIndex(inputLine) {
    // Step 1: Parse the input string into an array of numbers.
    // The original code implicitly converted strings to numbers during arithmetic operations.
    // Here, we explicitly convert them using `map(Number)` for clarity and type safety.
    const numericDataPoints = inputLine.split(',').map(Number);

    // Guard Clause 1: Ensure the input array has sufficient elements for processing.
    // Accessing `numericDataPoints[11]` (THRESHOLD_DIVISOR_ELEMENT_INDEX) requires at least 12 elements.
    if (numericDataPoints.length < EXPECTED_MINIMUM_INPUT_LENGTH) {
        console.error(
            `Error: Input line "${inputLine}" is too short. ` +
            `Expected at least ${EXPECTED_MINIMUM_INPUT_LENGTH} numeric values, but found ${numericDataPoints.length}. ` +
            `Skipping this line.`
        );
        return null; // Indicate failure to process this line
    }

    // Initialize a variable to accumulate sums. This variable will later be reused
    // to store the final threshold value for comparison.
    let runningCumulativeSum = 0;

    // Step 2: Calculate negative cumulative sums in reverse order.
    // The original loop (for `m=10` down to `1`, processing `j[m-1]`) effectively
    // processes elements from `j[9]` down to `j[0]`. It modifies the array in place.
    // This loop ensures that `numericDataPoints[i]` stores the negative sum of
    // `numericDataPoints[i]` through `numericDataPoints[9]` (original values).
    for (let currentElementIdx = CUMULATIVE_SUM_CALCULATION_COUNT - 1; currentElementIdx >= 0; currentElementIdx--) {
        runningCumulativeSum -= numericDataPoints[currentElementIdx];
        numericDataPoints[currentElementIdx] = runningCumulativeSum;
    }

    // Step 3: Calculate the threshold value for the subsequent search loop.
    // This calculation involves two specific elements from the input array
    // which were not modified by the previous cumulative sum loop (j[11] and j[10]).
    const valueForDivisorComponent = numericDataPoints[THRESHOLD_DIVISOR_ELEMENT_INDEX]; // Corresponds to original j[11]
    const valueForBaseComponent = numericDataPoints[THRESHOLD_BASE_ELEMENT_INDEX];     // Corresponds to original j[n] (where n=10)

    // Calculate `a` from the original code, which was `-j[11]`.
    const negatedDivisorComponent = -valueForDivisorComponent;

    // Calculate the denominator for the threshold factor.
    const denominator = (negatedDivisorComponent - valueForBaseComponent);

    // Guard Clause 2: Prevent division by zero, which would result in `Infinity` or `NaN`.
    if (denominator === 0) {
        console.error(
            `Error: Division by zero detected during threshold calculation for input line "${inputLine}". ` +
            `Denominator was zero. Skipping this line.`
        );
        return null;
    }

    // Update `runningCumulativeSum` to become the final threshold value for comparisons.
    // Original formula: `s *= a / (a - j[n]);`
    const thresholdFactor = negatedDivisorComponent / denominator;
    runningCumulativeSum *= thresholdFactor;

    // Step 4: Find the final target index by iterating downwards.
    // The original loop (`for(...; j[--n]>=s;);`) decrements `n` until `j[n]` is less than `s`.
    // `n` starts at `10` (from its initialization in the first loop).
    // The `--n` in the condition means it first decrements `n`, then checks `j[n]`.
    // So, it effectively checks `j[9]`, then `j[8]`, ..., down to `j[0]`.
    // The loop stops when `numericDataPoints[currentSearchCandidateIndex]` is less than `runningCumulativeSum`.

    let currentSearchCandidateIndex = THRESHOLD_BASE_ELEMENT_INDEX; // Initialize `n` to 10 as in the original code.

    // Loop downwards from `currentSearchCandidateIndex - 1` (i.e., index 9)
    // as long as the element is greater than or equal to the calculated threshold.
    // The loop terminates when an element is found that is strictly less than the threshold,
    // or when the beginning of the array (index 0) is reached.
    while (currentSearchCandidateIndex > 0 && numericDataPoints[currentSearchCandidateIndex - 1] >= runningCumulativeSum) {
        currentSearchCandidateIndex--;
    }

    // Step 5: Return the final calculated index.
    // The original code outputs `++n`. If the loop stops because `numericDataPoints[k] < runningCumulativeSum`,
    // then `k` is the value of `n` at that point. `++n` would then output `k+1`.
    // Our `currentSearchCandidateIndex` already holds this `k+1` value.
    // For example, if `numericDataPoints[2] < threshold` and `numericDataPoints[3] >= threshold`,
    // the loop stops when `currentSearchCandidateIndex` is `3`. This directly matches the `++n` logic.
    return currentSearchCandidateIndex;
}

// Main execution block:
// 1. Read the entire standard input.
// 2. Trim any leading/trailing whitespace from the whole input block.
// 3. Split the input into individual lines based on one or more whitespace characters (including newlines).
// 4. Filter out any empty lines that might result from splitting (e.g., multiple newlines).
// 5. Process each valid line using the `determineCalculatedIndex` function.
// 6. Print the result for each line, if processing was successful.
fileSystemModule.readFileSync("/dev/stdin", "utf8")
    .trim()
    .split(/\s+/)
    .filter(line => line.length > 0) // Ensure we don't process empty strings
    .forEach(line => {
        const resultIndex = determineCalculatedIndex(line);
        if (resultIndex !== null) {
            console.log(resultIndex);
        }
    });