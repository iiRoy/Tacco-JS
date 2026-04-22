const fsUtility = require('fs'); // Import the filesystem module for input operations.

// Define the standard input stream path.
const stdinSourcePath = '/dev/stdin';

// Read the entire content from the standard input as a UTF-8 string.
let rawStreamData = fsUtility.readFileSync(stdinSourcePath, 'utf8');

// --- Data Normalization and Parsing Stage ---
// Process the raw string data:
// 1. Remove any leading or trailing whitespace characters.
// 2. Split the string into an array of individual line segments.
// 3. Filter out any empty line segments to prevent `Number('')` which evaluates to `0`.
// 4. Convert each remaining line segment into its numerical representation.
const numericInputSequence = rawStreamData
    .trim()
    .split('\n')
    .filter(segment => segment.length > 0)
    .map(Number);

// Initialize a pointer to keep track of our current position within the numeric sequence.
let currentSequenceIndex = 0;

// A boolean flag to control the execution of the primary processing loop.
let shouldContinueProcessing = true;

// --- Main Processing Loop: Iterating Through Data Batches ---
// The loop continues as long as there are numbers left in the sequence to examine
// and our explicit processing flag indicates we should proceed.
while (currentSequenceIndex < numericInputSequence.length && shouldContinueProcessing) {

    // Retrieve the current batch's control value from the sequence.
    // This value indicates how many subsequent numbers to sum, after division.
    const batchSizeControlRaw = numericInputSequence[currentSequenceIndex];
    currentSequenceIndex++; // Advance the index immediately after reading.

    // Basic validation: Check if the control value is a valid number.
    // If not, it suggests malformed input; we log a warning and skip this iteration.
    if (isNaN(batchSizeControlRaw)) {
        console.error("Input Error: Encountered a non-numeric batch control value. Skipping this segment.");
        continue; // Proceed to the next potential batch.
    }

    // Calculate the effective number of items to sum for the current batch.
    // The original logic divides this control value by 4.
    const effectiveItemsToSum = batchSizeControlRaw / 4;

    // Termination Condition: If the effective count is zero, it signals the end of valid input batches.
    if (effectiveItemsToSum === 0) {
        shouldContinueProcessing = false; // Set flag to terminate the outer loop gracefully.
        break; // Exit the current loop iteration immediately.
    }

    // Advanced validation: Ensure the calculated number of items is a non-negative integer.
    // This prevents logical errors from fractional or negative counts.
    if (!Number.isInteger(effectiveItemsToSum) || effectiveItemsToSum < 0) {
        console.warn(`Input Warning: Invalid effective item count (${effectiveItemsToSum}) calculated for a batch. Skipping this batch.`);
        continue; // Skip to the next iteration of the main loop.
    }

    // Initialize an accumulator for the sum of values in the current batch.
    let currentBatchAccumulator = 0;
    // Counter to track how many items have been successfully added to the current batch's sum.
    let addedItemsCount = 0;

    // --- Inner Loop: Summing Elements Within the Current Batch ---
    // This loop runs as long as we haven't summed the required number of items
    // and there are still elements available in the overall input sequence.
    while (addedItemsCount < effectiveItemsToSum && currentSequenceIndex < numericInputSequence.length) {
        const currentNumericalElement = numericInputSequence[currentSequenceIndex];
        currentSequenceIndex++; // Advance the index for the next element.

        // Validate each individual element: ensure it's a number.
        // If not, log a warning and skip adding this specific item, but still count it
        // towards the total expected items to maintain alignment in the input stream.
        if (isNaN(currentNumericalElement)) {
            console.warn(`Input Warning: Non-numeric data item (${currentNumericalElement}) found in batch. Skipping this item.`);
            addedItemsCount++; // Still increment to mark an item 'processed' to avoid infinite loops.
            continue;
        }

        currentBatchAccumulator += currentNumericalElement; // Add the valid number to the total.
        addedItemsCount++; // Increment the count of items successfully added.
    }

    // --- Output Phase ---
    // Display the computed sum for the current batch to the console.
    console.log(currentBatchAccumulator);

    // Post-batch check: Warn if fewer items were processed than expected for the batch.
    if (addedItemsCount < effectiveItemsToSum) {
        console.warn(`Data Inconsistency: Expected ${effectiveItemsToSum} items but only processed ${addedItemsCount} in the last batch. Input stream may be truncated or malformed.`);
    }
}

// --- Final Check ---
// If the loop finished because the end of the `numericInputSequence` was reached,
// but the `shouldContinueProcessing` flag was still true, it implies the input
// stream ended without the expected '0' termination signal.
if (currentSequenceIndex === numericInputSequence.length && shouldContinueProcessing) {
    console.info("Processing complete. Input stream concluded without explicit '0' termination signal.");
}