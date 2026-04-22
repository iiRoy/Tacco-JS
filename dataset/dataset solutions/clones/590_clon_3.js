const fileSystem = require('fs'); // Import the Node.js file system module for input operations.

// Define a constant for the number of sub-items expected in each processing block.
const ITEM_COUNT_PER_BLOCK = 9;

/**
 * Robustly converts a string value to a number.
 * Returns 0 if the input is not a valid string, empty, or cannot be parsed into a finite number.
 * This prevents unexpected NaN results from malformed input.
 * @param {string | null | undefined} rawStringValue - The string to be converted.
 * @returns {number} The parsed number, or 0 if parsing fails.
 */
const safeParseNumeric = (rawStringValue) => {
    // Ensure the input is a string and not just whitespace.
    if (typeof rawStringValue !== 'string' || rawStringValue.trim() === '') {
        return 0; // Treat non-string or empty inputs as zero.
    }
    const convertedValue = Number(rawStringValue.trim()); // Attempt conversion.
    // Check if the conversion resulted in NaN (Not a Number) or is infinite.
    return Number.isFinite(convertedValue) ? convertedValue : 0; // Return 0 for invalid numbers.
};

// Acquire all incoming data from the standard input stream.
// This design pattern is typical for scripts that receive piped data.
const rawContentStream = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace, then split into an array of lines.
// Filter out any lines that become empty after trimming to avoid processing blank entries.
let availableInputLines = rawContentStream
    .trim()
    .split('\n')
    .filter(line => line.trim() !== '');

// Implement a preliminary check to ensure there's actual data to process.
// If the input is empty or contains only whitespace/blank lines, we can exit early.
if (availableInputLines.length === 0) {
    // No valid data lines were found, so nothing further to do.
    // console.warn("Input stream contained no processable data. Exiting."); // Optional diagnostic
    return; // Terminate script execution gracefully.
}

let currentBlockIdentifier = 0; // A counter to keep track of which block is being processed.

// Initiate the primary processing loop. This structure is equivalent to `while(true)`
// but can sometimes be preferred for explicit control flow with `break` statements.
for (;;) {
    currentBlockIdentifier++; // Increment the block counter for each iteration.

    // Guard against attempting to shift from an empty array.
    // If no more lines are available for the main value, the process is complete.
    if (availableInputLines.length === 0) {
        break; // Exit the loop as there's no more data.
    }

    // Extract and parse the main expected total for the current block.
    // The `safeParseNumeric` function ensures robustness against bad input.
    const primaryExpectedTotal = safeParseNumeric(availableInputLines.shift());

    // This specific condition (primaryExpectedTotal being 0) serves as the termination signal.
    if (primaryExpectedTotal === 0) {
        break; // A '0' as the primary total indicates the end of input blocks.
    }

    let accumulatedSubtotals = 0; // Initialize a variable to sum up the sub-values for this block.

    // Iterate to collect and sum the subsequent sub-values.
    // This loop expects a fixed number of items as defined by `ITEM_COUNT_PER_BLOCK`.
    for (let subItemIndex = 0; subItemIndex < ITEM_COUNT_PER_BLOCK; subItemIndex++) {
        // Crucial guard: check if there are enough lines left for the sub-items.
        // If not, we treat the missing items as '0' to prevent errors and ensure the loop completes.
        if (availableInputLines.length === 0) {
            // console.warn(`[Block ${currentBlockIdentifier}] Insufficient sub-items. Expected ${ITEM_COUNT_PER_BLOCK}, found ${subItemIndex} before end of input. Remaining treated as 0.`); // Optional warning
            accumulatedSubtotals += 0; // Add zero for any missing sub-items.
            continue; // Proceed to the next iteration to complete the ITEM_COUNT_PER_BLOCK cycle.
        }
        // Extract and sum the sub-item, using the robust parsing function.
        accumulatedSubtotals += safeParseNumeric(availableInputLines.shift());
    }

    // Compute the final result for the current block: the difference between the primary total and the sum of subtotals.
    const calculatedDifference = primaryExpectedTotal - accumulatedSubtotals;

    // Output the result to the console, using a descriptive label for clarity.
    console.log(`Result for Block ${currentBlockIdentifier}: ${calculatedDifference}`);
}

// Script execution concludes here.