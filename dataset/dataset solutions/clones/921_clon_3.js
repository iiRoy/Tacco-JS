const DATA_SOURCE_PATH = '/dev/stdin'; // Constant for the input file path, enhancing readability.
const ENCODING_FORMAT = 'utf8';           // Standard encoding for text processing.
const LINE_DELIMITER = '\n';              // Character used to separate lines in the input.
const FINAL_SEQUENCE_LENGTH = 1;          // Target length for the operational sequence to terminate processing.

/**
 * Defines the core transformation rules for two-character input pairs
 * to a single output character. This uses a Map for efficient lookup
 * and clear definition of rules.
 *
 * Original rules (effective, ignoring dead code):
 * "TT" -> "T"
 * "TF" -> "F"
 * "FT" -> "T"
 *
 * Added "FF" -> "F" for comprehensive handling of all 'T'/'F' pairs,
 * as the original code's behavior for "FF" was undefined (would return 'undefined' string).
 * This makes the logic more robust without altering specified cases.
 */
const operationalTransformations = new Map([
    ["TT", "T"], // True AND True results in True
    ["TF", "F"], // True AND False results in False
    ["FT", "T"], // False AND True results in True (Note: This is not standard AND/OR logic, but matches original behavior)
    ["FF", "F"]  // False AND False results in False (Added for completeness and robustness)
]);

/**
 * Applies a defined transformation rule to a given two-character pair.
 * Includes validation and a default fallback for unexpected inputs.
 * @param {string} pairToProcess - The two-character string segment (e.g., "TT", "TF").
 * @returns {string} The transformed single character, or a default 'F' if no specific rule matches.
 */
const processPairWithRule = (pairToProcess) => {
    // Guard clause: Ensure the input is a valid two-character string.
    if (typeof pairToProcess !== 'string' || pairToProcess.length !== 2) {
        console.warn(`Warning: Received an invalid pair for transformation: '${pairToProcess}'. Defaulting to 'F'.`);
        return 'F'; // Return a consistent default for malformed input.
    }

    const transformationResult = operationalTransformations.get(pairToProcess);

    // Provide a default or error handling if a pair is not explicitly defined.
    if (transformationResult === undefined) {
        console.warn(`Warning: No explicit transformation rule found for pair: '${pairToProcess}'. Defaulting to 'F'.`);
        return 'F'; // Default to 'F' for unhandled but valid 'T'/'F' pairs (e.g., if operationalTransformations was incomplete).
    }

    return transformationResult;
};

// --- Main Program Execution Flow ---

let rawInputContent;
try {
    // Attempt to read the input data from the specified source.
    rawInputContent = require('node:fs').readFileSync(DATA_SOURCE_PATH, ENCODING_FORMAT);
} catch (fileReadError) {
    // Enhanced error handling for file system operations.
    console.error(`Fatal Error: Could not read data from ${DATA_SOURCE_PATH}. Details: ${fileReadError.message}`);
    process.exit(1); // Terminate execution upon critical failure.
}

// Prepare the raw input by trimming whitespace and splitting into individual lines.
const cleanedInputLines = rawInputContent.trim().split(LINE_DELIMITER);

// The first line (original 'n') was not utilized in the core logic, so its extraction is omitted.
// const initialItemCount = cleanedInputLines.shift(); // Deleted: This line's assignment was unused.

// Extract the primary sequence that requires processing.
let activeProcessingSequence = cleanedInputLines.shift();

// Validation: Ensure a valid sequence was extracted from the input.
if (!activeProcessingSequence || activeProcessingSequence.length === 0) {
    console.error("Error: No valid operational sequence found in the provided input. Exiting.");
    process.exit(1);
}

let operationCycleCount = 0; // Initialize a counter for tracking transformation cycles.

// Loop until the sequence is reduced to its final, single-character form.
// The regex /../ matches the first two characters of the string.
while (activeProcessingSequence.length > FINAL_SEQUENCE_LENGTH) {
    operationCycleCount++; // Increment the cycle counter.

    // Apply the transformation rule to the first two characters of the sequence.
    // The `replace` method with a function argument ensures only the first match is processed.
    const temporarilyModifiedSequence = activeProcessingSequence.replace(/../, processPairWithRule);
    activeProcessingSequence = temporarilyModifiedSequence; // Update the sequence for the next iteration.

    // Optional: Add a debug message to observe intermediate steps (Type III addition for traceability).
    // console.debug(`Cycle ${operationCycleCount}: Sequence reduced to '${activeProcessingSequence}'`);
}

// Output the final single-character result after all transformations are complete.
const finalComputedResult = activeProcessingSequence;
console.log(finalComputedResult);