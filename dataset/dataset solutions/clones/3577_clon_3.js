const fileSystemModule = require("fs"); // Import Node.js File System module

/**
 * Defines standard outcome messages for the validation process.
 * Using constants improves readability and maintainability.
 */
const VALIDATION_SUCCESS_MESSAGE = "Yes";
const VALIDATION_FAILURE_MESSAGE = "No";

/**
 * Reads and parses numeric data from standard input.
 * Expects numbers separated by newlines. Filters out empty lines.
 * @returns {number[]} An array of numbers parsed from the input.
 */
const retrieveAndParseNumericInput = () => {
    // Specify the standard input device path
    const standardInputDevicePath = "/dev/stdin";

    // Read the raw content synchronously from the specified path, encoded as UTF-8
    const rawContentBuffer = fileSystemModule.readFileSync(standardInputDevicePath, "utf8");

    // Split the raw content by newline characters
    // Filter out any empty strings that might result from extra newlines
    // Map each non-empty string to its numeric representation
    const parsedNumericData = rawContentBuffer
        .split("\n")
        .filter(line => line.trim() !== '') // Ensure no empty lines are processed
        .map(valueString => Number(valueString)); // Convert string to number

    return parsedNumericData;
};

/**
 * Checks if two numbers have different parities (one even, one odd).
 * @param {number} firstValue - The first number.
 * @param {number} secondValue - The second number.
 * @returns {boolean} True if parities are different, false otherwise.
 */
const haveMismatchedParity = (firstValue, secondValue) => {
    // The bitwise XOR operator (^) followed by bitwise AND (& 1)
    // is a common competitive programming trick to check if two numbers
    // have different parities. It's equivalent to (firstValue % 2) !== (secondValue % 2).
    return ((firstValue ^ secondValue) & 1) !== 0;
};

/**
 * Main validation routine for the numeric sequence.
 * This function implements a specific set of rules to determine
 * if the input sequence conforms to a required pattern.
 * @returns {string} "Yes" if the sequence is valid, "No" otherwise.
 */
function processAndValidateNumericSequence() {
    // Obtain the numeric data from the input source
    const inputSequenceData = retrieveAndParseNumericInput();

    // --- Initial Input Validation ---
    // A sequence must have at least one element to specify its length.
    if (inputSequenceData.length === 0) {
        return VALIDATION_FAILURE_MESSAGE;
    }

    // The first element of the input sequence defines the total number of elements
    // that should be processed in the main loop (excluding itself).
    const designatedSequenceLength = inputSequenceData[0];

    // Ensure the designated length is non-negative and that the input array
    // contains enough elements as indicated by the designated length plus the length element itself.
    if (designatedSequenceLength < 0 || inputSequenceData.length < designatedSequenceLength + 1) {
        return VALIDATION_FAILURE_MESSAGE;
    }

    // A Set is used to efficiently track numbers that have been "processed" or "visited"
    // within the context of segment validation, preventing redundant processing or
    // ensuring unique usage where required.
    const processedElementRegistry = new Set();

    // --- Main Sequence Iteration Loop ---
    // This loop iterates from the first actual data element (index 1) up to the designated length.
    // The `currentEvaluationIndex` might be modified within the inner `while` loop,
    // which is crucial for the algorithm's control flow.
    for (let currentEvaluationIndex = 1; currentEvaluationIndex <= designatedSequenceLength; currentEvaluationIndex++) {
        const elementValueAtCurrentIndex = inputSequenceData[currentEvaluationIndex];

        // --- Rule 1: Parity Check ---
        // The value at the current index must have the same parity as the index itself.
        if (haveMismatchedParity(elementValueAtCurrentIndex, currentEvaluationIndex)) {
            return VALIDATION_FAILURE_MESSAGE;
        }

        // Initialize dynamic boundaries for the current segment being evaluated.
        // `segmentRightBoundary` tracks the maximum index encountered within the current segment.
        // `segmentLeftAnchor` stores the starting `currentEvaluationIndex` for this segment's inner loop.
        let segmentRightBoundary = elementValueAtCurrentIndex;
        let segmentLeftAnchor = currentEvaluationIndex;

        // Mark the initial `segmentRightBoundary` as processed.
        processedElementRegistry.add(segmentRightBoundary);

        // --- Inner Segment Validation Loop ---
        // This loop processes elements within a segment defined by `segmentLeftAnchor` and `segmentRightBoundary`.
        // It continues as long as the `currentEvaluationIndex` has not reached the `segmentRightBoundary`.
        while (currentEvaluationIndex < segmentRightBoundary) {
            // Advance the index to check the next element in the sequence.
            currentEvaluationIndex++; // First increment

            const nextElementInSegment = inputSequenceData[currentEvaluationIndex];

            // --- Rule 2: Sequential Value Check ---
            // The element immediately following `segmentLeftAnchor` (after the first `i++`)
            // must be equal to its own index.
            if (nextElementInSegment !== currentEvaluationIndex) {
                return VALIDATION_FAILURE_MESSAGE;
            }

            // Advance the index again, effectively skipping one element after the sequential check.
            currentEvaluationIndex++; // Second increment

            const elementAfterSkip = inputSequenceData[currentEvaluationIndex];

            // --- Rule 3: Parity Check After Skip ---
            // The element after the skipped one must also have the same parity as its index.
            if (haveMismatchedParity(elementAfterSkip, currentEvaluationIndex)) {
                return VALIDATION_FAILURE_MESSAGE;
            }

            // --- Segment Boundary Adjustment Logic ---
            // If the `elementAfterSkip` extends the current `segmentRightBoundary`, update it.
            if (elementAfterSkip > segmentRightBoundary) {
                segmentRightBoundary = elementAfterSkip;
                // Mark the new maximum boundary as processed.
                processedElementRegistry.add(segmentRightBoundary);
            }
            // If `elementAfterSkip` matches the `segmentLeftAnchor`, adjust the `segmentLeftAnchor`.
            else if (elementAfterSkip === segmentLeftAnchor) {
                let nextCandidateAnchor = segmentLeftAnchor;
                // Increment `nextCandidateAnchor` by 2 until an unprocessed value is found.
                // This effectively finds the next available "slot" for an anchor point.
                while (processedElementRegistry.has(nextCandidateAnchor)) {
                    nextCandidateAnchor += 2;
                }
                segmentLeftAnchor = nextCandidateAnchor; // Update the segment's left anchor
            }
            // If neither of the above conditions is met, the sequence is invalid.
            else {
                return VALIDATION_FAILURE_MESSAGE;
            }
        }
    }

    // If the entire sequence is processed without returning a failure message, it is valid.
    return VALIDATION_SUCCESS_MESSAGE;
}

// --- Execution Block ---
// This immediately-invoked function expression (IIFE) handles the program's execution flow.
(() => {
    // Execute the main validation function
    const finalValidationResult = processAndValidateNumericSequence();

    // Output the result to the console
    console.log(finalValidationResult);
})();