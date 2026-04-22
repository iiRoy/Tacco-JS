/**
 * This module processes a sequence of integers to identify and count subarrays
 * where the bitwise XOR sum equals the arithmetic sum of its elements.
 *
 * The problem involves reading two lines of input:
 * 1. The first line contains a single integer, representing the number of elements in the sequence.
 * 2. The second line contains space-separated integers, which are the elements of the sequence.
 *
 * The function then iterates through all possible contiguous subarrays within the sequence.
 * For each subarray, it calculates both its XOR sum and its arithmetic sum.
 * If these two sums are found to be equal, a counter is incremented.
 * The final count, which includes all single-element subarrays (as their XOR sum always equals their arithmetic sum),
 * is then output to the console.
 */
function CalculateMatchingSubarrayPairs(rawInputSource) {
    // --- Phase 1: Input Validation and Parsing ---

    // Ensure the provided input is a valid string and not empty.
    if (typeof rawInputSource !== 'string' || rawInputSource.trim() === '') {
        console.error("Error: Input data is missing or invalid. Please provide a non-empty string.");
        return; // Exit if input is unusable.
    }

    // Split the input string into individual lines.
    // Filtering out empty lines provides robustness against extra newlines.
    const inputLineSegments = rawInputSource.split('\n').filter(line => line.trim() !== '');

    // The first line should contain the length of the array.
    const arrayLengthString = inputLineSegments[0];
    const arrayLength = Number.parseInt(arrayLengthString, 10); // Explicitly parse as base-10 integer.

    // Validate the parsed array length.
    if (Number.isNaN(arrayLength) || arrayLength < 0) {
        console.error(`Error: Invalid array length specified: '${arrayLengthString}'. Must be a non-negative integer.`);
        return;
    }

    // Handle the trivial case where the array is empty.
    if (arrayLength === 0) {
        console.log("0"); // An empty array has 0 matching subarrays.
        return;
    }

    // Ensure there's a second line for the actual sequence of numbers.
    if (inputLineSegments.length < 2) {
        console.error("Error: Input data is incomplete. Expected array elements on the second line.");
        return;
    }

    // The second line contains the space-separated integer sequence.
    const valueTokens = inputLineSegments[1].split(' ');
    // Convert string tokens to integers using map for a concise approach.
    const integerSequence = valueTokens.map(token => Number.parseInt(token, 10));

    // Validate the parsed integer sequence: check for NaNs and correct length.
    if (integerSequence.some(Number.isNaN) || integerSequence.length !== arrayLength) {
        console.error("Error: Mismatch in array length or invalid numbers detected in the input sequence.");
        return;
    }

    // --- Phase 2: Core Logic - Subarray Summation and Comparison ---

    // Initialize the counter for matching subarrays.
    // Each single-element subarray (e.g., [x]) always satisfies the condition
    // because x XOR x is 0, and x + x is 2x, but for a single element, x XOR x is just x, and x + x is just x.
    // Ah, wait. For a single element `a[i]`, `xor=a[i]` and `sum=a[i]`. So they are always equal.
    // The initial value of `arrayLength` correctly accounts for all single-element subarrays.
    let totalMatchesCount = arrayLength;

    // Iterate through all possible starting points of a subarray.
    for (let startIndex = 0; startIndex < arrayLength; ++startIndex) {
        // Initialize XOR sum and arithmetic sum for the current subarray,
        // starting with the element at `startIndex`.
        const currentElementAtIndex = integerSequence[startIndex];
        let currentXorValue = currentElementAtIndex;
        let currentSumValue = currentElementAtIndex;

        // Iterate through subsequent elements to extend the current subarray.
        // The inner loop starts from `startIndex + 1` because single-element subarrays
        // are already accounted for in `totalMatchesCount` initialization.
        for (let endIndex = startIndex + 1; endIndex < arrayLength; ++endIndex) {
            const nextElementInSequence = integerSequence[endIndex];

            // Update both sums by including the next element.
            currentXorValue ^= nextElementInSequence;
            currentSumValue += nextElementInSequence;

            // Check if the calculated sums are equal.
            if (currentXorValue === currentSumValue) {
                totalMatchesCount++; // Increment the counter if they match.
            }
        }
    }

    // --- Phase 3: Output Result ---

    // Print the final count of subarrays that satisfy the condition.
    console.log(totalMatchesCount.toString());
}

/**
 * A diagnostic function to test the core logic with a predefined sample input.
 * This can be useful for debugging or local development without external input.
 */
// function executeWithTestScenario() {
//     // Example input: "3\n1 2 3"
//     // Subarrays:
//     // [1] -> xor=1, sum=1 (match) - accounted by initial totalMatchesCount=3
//     // [2] -> xor=2, sum=2 (match) - accounted by initial totalMatchesCount=3
//     // [3] -> xor=3, sum=3 (match) - accounted by initial totalMatchesCount=3
//     // [1,2] -> xor=1^2=3, sum=1+2=3 (match) - increments counter
//     // [2,3] -> xor=2^3=1, sum=2+3=5 (no match)
//     // [1,2,3] -> xor=(1^2)^3=3^3=0, sum=1+2+3=6 (no match)
//     // Expected output for "3\n1 2 3": 4
//     const sampleInputData = "3\n1 2 3";
//     console.log("--- Initiating local test run with sample data ---");
//     CalculateMatchingSubarrayPairs(sampleInputData);
//     console.log("--- Local test run concluded ---");
// }
// Uncomment the line below to run the test scenario manually in a development environment.
// executeWithTestScenario();


// --- Entry Point for Execution in a Node.js Environment ---
// This Immediately Invoked Function Expression (IIFE) handles reading input
// from standard input, typical for competitive programming platforms.
(function processStandardInput() {
    try {
        const fileSystemModule = require("fs"); // Import Node.js filesystem module.
        // Read all data from /dev/stdin (standard input) as a UTF-8 string.
        const standardInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        // Pass the read input to the main processing function.
        CalculateMatchingSubarrayPairs(standardInputBuffer);
    } catch (inputReadError) {
        // Log an error if reading from stdin fails, which might happen in non-standard environments.
        console.error("Error: Failed to read from standard input stream.", inputReadError.message);
        // Optionally, provide a fallback or exit gracefully.
        // process.exit(1);
    }
})();