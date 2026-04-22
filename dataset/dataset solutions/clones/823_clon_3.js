/**
 * This module is designed to process numerical inputs,
 * identifying how many distinct ways each number can be expressed
 * as a sum of two or more consecutive positive integers.
 * Input is expected to be provided line by line, with a '0' indicating termination.
 */

/**
 * Executes the primary logic for analyzing a sequence of numbers.
 * It reads numbers from the provided raw string, processes each,
 * and compiles the results for final output.
 *
 * @param {string} rawDataString - A multi-line string where each line represents a number.
 */
const processInputData = (rawDataString) => {
    // Divide the entire input block into an array of individual string lines.
    // Each element in this collection is a potential number for analysis.
    const linesArray = rawDataString.split("\n");

    // An array to store the calculated count of consecutive sums for each valid input number.
    // This allows for batch output at the end, rather than line-by-line printing.
    const collectedResults = [];

    // Initialize an index to track the current line being processed from `linesArray`.
    let currentLineIndex = 0;

    // Outer control flow loop: Iterates through the input lines.
    // This loop is designed to run indefinitely until an explicit break condition is met.
    while (true) {
        // Attempt to convert the string representation of the current line into a numeric value.
        // The unary plus operator `+` is a concise way to achieve this type conversion.
        const targetNumericValue = +linesArray[currentLineIndex];

        // --- Input Validation and Termination Condition ---
        // If the parsed value is not a valid number (e.g., an empty line, non-numeric content),
        // or if the value is zero, it signals the end of the input sequence.
        if (Number.isNaN(targetNumericValue) || targetNumericValue === 0) {
            // Encountering a zero or an invalid number signifies that no further numbers
            // are to be processed from the input stream.
            break;
        }

        // Initialize a counter for the current `targetNumericValue`.
        // This variable will store the total number of ways it can be represented
        // as a sum of consecutive positive integers.
        let consecutiveRepresentationCount = 0;

        // Inner iteration loop: Explores different possible lengths for the consecutive sequences.
        // The sequence length (`seqLen`) starts from 2 (as "consecutive" implies at least two numbers).
        // The loop continues as long as `seqLen` is less than `targetNumericValue`.
        // This upper bound is chosen because a sequence of `targetNumericValue` integers starting from 1
        // would sum to `targetNumericValue * (targetNumericValue + 1) / 2`, which is greater than `targetNumericValue`
        // for `targetNumericValue > 1`.
        for (let seqLen = 2; seqLen < targetNumericValue; seqLen++) {
            // Calculate the sum of the first `seqLen - 1` positive integers.
            // This is a standard arithmetic series sum: `(n * (n + 1)) / 2`.
            // Here `n` is `seqLen - 1`.
            const sumOfInitialSegment = (seqLen * (seqLen - 1)) / 2;

            // Determine the remainder needed from `targetNumericValue` after accounting for
            // the sum of the first `seqLen - 1` integers.
            // If `targetNumericValue` is `S = k + (k+1) + ... + (k+seqLen-1)`,
            // then `S = seqLen * k + sum(0 to seqLen-1) = seqLen * k + (seqLen * (seqLen-1))/2`.
            // So `targetNumericValue - (seqLen * (seqLen-1))/2 = seqLen * k`.
            const neededRemainder = targetNumericValue - sumOfInitialSegment;

            // --- Conditions for a Valid Consecutive Sum ---
            // 1. `neededRemainder` must be strictly positive. This ensures that the
            //    starting number `k` (where `k = neededRemainder / seqLen`) is non-negative.
            //    If `k=0`, the sequence starts from 1.
            // 2. `neededRemainder` must be perfectly divisible by `seqLen`.
            //    This guarantees that `k` is an integer, meaning a valid starting point
            //    for the consecutive sequence exists.
            if (neededRemainder > 0 && (neededRemainder % seqLen === 0)) {
                // If both criteria are met, we have successfully identified another way
                // to express `targetNumericValue` as a sum of `seqLen` consecutive integers.
                consecutiveRepresentationCount++;
            }
        }

        // Store the final count for the current `targetNumericValue` into our results collection.
        collectedResults.push(consecutiveRepresentationCount);

        // Advance the index to move to the next line in the input array.
        currentLineIndex++;
    }

    // After processing all relevant input lines, print all the accumulated results.
    // Each result is separated by a newline character for clear, sequential output.
    console.log(collectedResults.join('\n'));
};

// --- Execution Entry Point ---
// This immediately-invoked function expression (IIFE) handles the initial
// setup, including reading from standard input and error management.
(function performInputOutputOperations() {
    // Define the standard path for reading input, typically `/dev/stdin` on POSIX systems.
    const standardInputSourcePath = "/dev/stdin";
    // Specify the character encoding to use when reading the input file.
    const fileEncodingFormat = "utf8";

    try {
        // Dynamically import the Node.js 'fs' (file system) module.
        const fileSystemUtility = require("fs");

        // Read the entire content from the specified standard input path synchronously.
        // This ensures the script waits until all input is available before proceeding.
        const rawInputContent = fileSystemUtility.readFileSync(standardInputSourcePath, fileEncodingFormat);

        // Invoke the main processing function with the raw content obtained from standard input.
        processInputData(rawInputContent);
    } catch (ioError) {
        // Catch and report any errors that occur during the file reading or initial setup phases.
        // This provides robust error feedback to the user or system.
        console.error("An operational fault occurred during input acquisition or processing:", ioError.message);
        // Exit the process with a non-zero status code to indicate an error condition.
        process.exit(1);
    }
})();