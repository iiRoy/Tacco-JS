// This JavaScript module is designed to meticulously process streams of numeric input,
// interpreting them as sequential blocks of data. Each block is expected to contain
// a predefined number of entries, which are then analyzed for uniqueness and specific
// numerical patterns (1, 2, or 3). Based on these patterns, a corresponding outcome
// array is generated and its elements are printed to standard output.

// --- Global Configuration and Setup ---

// Ensure the standard input stream is actively listening for data.
// This is a foundational step for any interactive command-line application.
process.stdin.resume();

// Explicitly set the encoding for the standard input stream to 'utf8'.
// This guarantees consistent interpretation of incoming character data,
// preventing potential issues with multi-byte characters or unexpected symbols.
process.stdin.setEncoding('utf8');

// Define a constant for the expected number of entries within each processing block.
// Using a constant improves code readability and simplifies future modifications
// to the block structure.
const EXPECTED_BLOCK_ITEM_COUNT = 5;

// A buffer to accumulate partial lines or pending input data.
// Input often arrives in chunks that do not perfectly align with newline characters,
// so this buffer ensures complete lines are processed correctly.
let inputDataAccumulator = '';

/**
 * Analyzes a given block of numerical entries (as strings) to determine a specific
 * outcome pattern. The logic hinges on the count of unique values (1, 2, or 3)
 * and which of these specific numbers might be absent.
 *
 * @param {string[]} currentBlockEntries An array of string-represented numbers
 *                                       (expected to be '1', '2', or '3') for the current block.
 * @returns {number[]} A numeric array representing the calculated outcome pattern.
 *                     Returns default error patterns for unexpected input scenarios.
 */
function deriveBlockResultPattern(currentBlockEntries) {
    // Utilize a Set for efficient identification and storage of unique elements.
    // Sets provide O(1) average time complexity for adding and checking existence,
    // which is more performant than array-based `indexOf` for uniqueness checks.
    const distinctBlockValues = new Set();
    currentBlockEntries.forEach(entryString => {
        // Trim whitespace and add the string representation to the Set.
        // The original logic implicitly used string comparison for uniqueness (e.g., indexOf(v)).
        distinctBlockValues.add(entryString.trim());
    });

    let computedResultPattern; // This array will hold the final pattern for the block.
    const uniqueValueCount = distinctBlockValues.size;

    // --- Core Logic for Pattern Determination ---
    // The outcome pattern is heavily dependent on the number of unique elements
    // and their specific identity (which numbers are present/missing).

    if (uniqueValueCount === 3 || uniqueValueCount === 1) {
        // Scenario 1: If there are exactly three unique values (e.g., '1', '2', '3')
        // or only one unique value (e.g., all '1's), the pattern is fixed.
        // This corresponds to the 'aiko' pattern from the original problem context.
        computedResultPattern = [3, 3, 3];
    } else if (uniqueValueCount === 2) {
        // Scenario 2: If there are exactly two unique values, we need to identify
        // which of the numbers ('1', '2', or '3') is conspicuously absent.
        if (!distinctBlockValues.has('1')) {
            // '1' is missing from the block's unique values.
            computedResultPattern = [1, 2, 0];
        } else if (!distinctBlockValues.has('2')) {
            // '2' is missing.
            computedResultPattern = [2, 0, 1];
        } else if (!distinctBlockValues.has('3')) {
            // '3' is missing.
            computedResultPattern = [0, 1, 2];
        } else {
            // This 'else' branch is a robust guard for unexpected data.
            // If `uniqueValueCount` is 2, but none of '1', '2', or '3' are missing,
            // it implies the input contained other numbers (e.g., '4', '5').
            // The original problem context usually assumes input limited to '1', '2', '3'.
            console.warn('Warning: Two unique values found, but expected numbers (1, 2, 3) are all present. Input may be outside expected range. Defaulting to neutral pattern.');
            computedResultPattern = [0, 0, 0]; // A neutral fallback pattern.
        }
    } else {
        // Scenario 3: Any other count of unique values (0, 4, or more).
        // This indicates potentially malformed input or a scenario not covered
        // by the primary logic branches.
        console.error(`Error: Unexpected number of distinct elements (${uniqueValueCount}) in block. Input data might be invalid. Returning error pattern.`);
        computedResultPattern = [-1, -1, -1]; // An explicit error indicator pattern.
    }

    return computedResultPattern;
}

// --- Standard Input Data Handler ---

// Attach an event listener to the 'data' event of the standard input stream.
// This function will be invoked whenever new data chunks are available.
process.stdin.on('data', function processInputChunk(incomingChunk) {
    // Append the newly received chunk to our accumulator.
    inputDataAccumulator += incomingChunk;

    // Split the accumulated data into individual lines.
    // The last element of `allParts` might be an incomplete line,
    // so we separate it for later processing.
    const allParts = inputDataAccumulator.split('\n');
    let completeLinesForProcessing = allParts.slice(0, -1); // All lines fully terminated by newline.
    inputDataAccumulator = allParts[allParts.length - 1]; // The potentially incomplete last line.

    // Begin processing the complete lines.
    // The loop continues as long as there are lines to process AND the very first line
    // does not contain the termination signal ('0').
    while (completeLinesForProcessing.length > 0 && Number(completeLinesForProcessing[0].trim()) !== 0) {
        // Guard clause: If we don't have enough complete lines to form a full block,
        // then we must wait for more input. Re-buffer the current lines and exit the loop.
        if (completeLinesForProcessing.length < EXPECTED_BLOCK_ITEM_COUNT) {
            inputDataAccumulator = completeLinesForProcessing.join('\n') +
                                   (inputDataAccumulator ? '\n' + inputDataAccumulator : '');
            completeLinesForProcessing = []; // Clear the lines, effectively pausing processing.
            break;
        }

        // --- Block Extraction and Validation ---

        // Extract the current block of entries. `slice` creates a new array,
        // leaving `completeLinesForProcessing` with the remaining data.
        const currentDataBlock = completeLinesForProcessing.slice(0, EXPECTED_BLOCK_ITEM_COUNT);
        completeLinesForProcessing = completeLinesForProcessing.slice(EXPECTED_BLOCK_ITEM_COUNT);

        // Perform a more rigorous validation on each item within the block.
        // Ensure that every entry is one of the expected numeric strings ('1', '2', '3').
        const isValidBlock = currentDataBlock.every(item =>
            ['1', '2', '3'].includes(item.trim())
        );

        if (!isValidBlock) {
            console.error('Error: A block contained invalid or out-of-range entries. Skipping this block for safety.');
            continue; // Move to the next potential block.
        }

        // --- Block Processing ---

        try {
            // Determine the outcome pattern for the validated block.
            const blockResultingPattern = deriveBlockResultPattern(currentDataBlock);

            // Iterate through each original item in the block and print its
            // corresponding value from the derived pattern.
            currentDataBlock.forEach(originalItemString => {
                const numericValue = Number(originalItemString.trim());
                // Validate the index before accessing the pattern array to prevent errors.
                const patternIndex = numericValue - 1;
                if (patternIndex >= 0 && patternIndex < blockResultingPattern.length) {
                    console.log(blockResultingPattern[patternIndex]);
                } else {
                    // This error occurs if `numericValue` is not 1, 2, or 3,
                    // which should ideally be caught by `isValidBlock` but serves as a final safeguard.
                    console.error(`Critical Error: Item '${originalItemString}' yielded an invalid index for the result pattern. Outputting placeholder.`);
                    console.log(-999); // A distinct value for internal error indication.
                }
            });
        } catch (processingIssue) {
            // Catch and report any unexpected errors that occur during the
            // pattern derivation or printing phase for a specific block.
            console.error('An unhandled exception occurred while processing a block:', processingIssue.message);
        }
    }

    // --- Post-Loop Clean-up and Termination ---

    // If the loop exited because `completeLinesForProcessing[0]` was '0',
    // then the remaining lines in `completeLinesForProcessing` (including '0' and any subsequent lines)
    // should be discarded, as per the original code's behavior.
    if (completeLinesForProcessing.length > 0 && Number(completeLinesForProcessing[0].trim()) === 0) {
        // Signal that processing should halt.
        console.log('Termination signal (0) received. Halting further input processing.');
        // Clear any remaining lines to prevent them from being re-buffered or processed.
        completeLinesForProcessing = [];
        // Optionally, one could explicitly stop the stdin stream or exit the process here.
        // process.stdin.pause();
        // process.exit(0);
    }
    // Any lines remaining in `completeLinesForProcessing` at this point would have been
    // re-buffered into `inputDataAccumulator` if they were less than a full block.
    // If the loop finished normally (no '0' and no more full blocks),
    // and `completeLinesForProcessing` is not empty, it means these are partial blocks
    // that were already moved to `inputDataAccumulator` in the `if (length < EXPECTED_BLOCK_ITEM_COUNT)` block.
});

// The original code included an empty 'end' event handler.
// For a Type III clone, non-essential (empty) statements can be removed
// to simplify the code, as they contribute no functional value.
// process.stdin.on('end', function() { /* No explicit action needed on stream end */ });