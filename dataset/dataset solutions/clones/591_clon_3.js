const fileSystemOperations = require('node:fs');

// Define constants to enhance clarity and maintainability of the code.
// These represent fixed parameters for the input and processing logic.
const STANDARD_INPUT_PATH = '/dev/stdin';
const TEXT_ENCODING_FORMAT = 'utf8';
const DATA_BLOCK_SIZE = 10; // Each logical block of data consists of 10 consecutive lines.

/**
 * Executes the primary data processing flow.
 * This function reads numerical data from standard input,
 * processes it in fixed-size blocks, and prints a derived result for each block.
 * Processing halts if a block's leading value is zero.
 */
function performBlockwiseDataAnalysis() {
    let rawContentFromInput;
    try {
        // Attempt to synchronously read all data from the standard input stream.
        rawContentFromInput = fileSystemOperations.readFileSync(STANDARD_INPUT_PATH, TEXT_ENCODING_FORMAT);
    } catch (ioError) {
        // If an error occurs during file reading (e.g., file not found, permissions),
        // log the error and terminate the program gracefully.
        console.error(`Error encountered while accessing input from ${STANDARD_INPUT_PATH}:`, ioError.message);
        process.exit(1); // Indicate an abnormal termination.
    }

    // Validate that some content was actually read.
    if (!rawContentFromInput || rawContentFromInput.length === 0) {
        // If the input stream is empty, there's nothing to process.
        // console.warn("No data was provided via standard input. Program will exit.");
        return;
    }

    // Process the raw input: remove leading/trailing whitespace and split into an array of lines.
    // Each element in `processedDataLines` corresponds to a line from the input.
    const processedDataLines = rawContentFromInput.trim().split('\n');

    // Ensure that after splitting, we actually have lines to work with.
    if (processedDataLines.length === 0) {
        // console.warn("Input stream contained only whitespace or no discernible lines. Program will exit.");
        return;
    }

    // Initialize the pointer for the current block's starting line index.
    // A `while` loop is chosen here to explicitly manage the index advancement,
    // which aligns with the original code's specific `I+=10` behavior within a `for(I; I<...; I++)` loop.
    let currentBlockInitialIndex = 0;

    // Continue processing as long as there are enough lines remaining for at least the start of a block.
    while (currentBlockInitialIndex < processedDataLines.length) {
        // Extract the string representation of the first element in the current block.
        const blockFirstElementString = processedDataLines[currentBlockInitialIndex];

        // Convert this string to a number. `Number()` handles non-numeric strings by returning `NaN`.
        const blockFirstNumericValue = Number(blockFirstElementString);

        // --- Validation: Check if the block's leading value is a valid number. ---
        if (isNaN(blockFirstNumericValue)) {
            // If the leading element is not a number, this block cannot be processed meaningfully.
            // Log a warning (optional) and advance the index to skip this problematic block.
            // console.warn(`Invalid numeric format for leading value at line ${currentBlockInitialIndex + 1}: '${blockFirstElementString}'. Skipping this data block.`);
            currentBlockInitialIndex += DATA_BLOCK_SIZE + 1; // Advance to the expected start of the next block.
            continue; // Proceed to the next iteration of the while loop.
        }

        // --- Termination Condition: Stop processing if the leading value is zero. ---
        // This is a critical control flow mechanism of the original algorithm.
        if (blockFirstNumericValue === 0) {
            // console.info("Detected a zero as the leading value of a block. Terminating further block processing.");
            break; // Exit the `while` loop, ending the program's data analysis.
        }

        // --- Pre-check: Ensure there are enough lines for a complete block. ---
        // A block requires `DATA_BLOCK_SIZE` (10) elements.
        if (currentBlockInitialIndex + DATA_BLOCK_SIZE > processedDataLines.length) {
            // If we don't have enough lines for a full block, remaining processing is impossible.
            // console.warn(`Insufficient lines remaining for a complete block starting at line ${currentBlockInitialIndex + 1}. Required: ${DATA_BLOCK_SIZE}, Available: ${processedDataLines.length - currentBlockInitialIndex}. Halting.`);
            break; // Exit the loop, as no more full blocks can be formed.
        }

        // Initialize an accumulator for the sum of elements *following* the leading value.
        // The original problem's output `Sum - sum` (where `Sum` is `Arr[I]` and `sum` is `Arr[I] + ... + Arr[I+9]`)
        // simplifies to `-(Arr[I+1] + ... + Arr[I+9])`.
        // This variable will hold this sum directly.
        let accumulatedSumOfSubsequentElements = 0;

        // Iterate through the elements from the second one (offset 1) up to the last in the block.
        // This loop covers `DATA_BLOCK_SIZE - 1` (9) elements.
        for (let blockRelativeOffset = 1; blockRelativeOffset < DATA_BLOCK_SIZE; blockRelativeOffset++) {
            const absoluteLineIndex = currentBlockInitialIndex + blockRelativeOffset;
            const currentElementString = processedDataLines[absoluteLineIndex];
            const currentNumericValue = Number(currentElementString);

            // --- Validation: Check if the current element is a valid number. ---
            // The original code's `Arr[I+i]-0` would result in `NaN` if `Arr[I+i]` is non-numeric,
            // and `sum += NaN` would make the entire `sum` variable `NaN`.
            // We replicate this behavior by setting our accumulator to `NaN` if any element is invalid.
            if (isNaN(currentNumericValue)) {
                // console.warn(`Non-numeric element found at line ${absoluteLineIndex + 1}: '${currentElementString}'. The block's final result will be NaN.`);
                accumulatedSumOfSubsequentElements = NaN; // Propagate NaN to the final result.
                break; // No need to continue summing if the result is already determined to be NaN.
            }

            accumulatedSumOfSubsequentElements += currentNumericValue;
        }

        // Output the final calculated value for the current block.
        // If any element in the sum was invalid, the result will be NaN.
        if (isNaN(accumulatedSumOfSubsequentElements)) {
            console.log(NaN);
        } else {
            // The derived result is the negative of the sum of the subsequent 9 elements.
            // This is functionally equivalent to `blockFirstNumericValue - (blockFirstNumericValue + accumulatedSumOfSubsequentElements)`.
            console.log(0 - accumulatedSumOfSubsequentElements);
        }

        // Advance the starting index for the next processing block.
        // The original code's `I+=10` inside a `for(I; I<...; I++)` loop, combined with the implicit `I++`
        // at the end of each `for` iteration, means the index effectively jumps by `10 + 1 = 11` lines.
        currentBlockInitialIndex += DATA_BLOCK_SIZE + 1;
    }
}

// Invoke the main function to begin the data processing.
performBlockwiseDataAnalysis();