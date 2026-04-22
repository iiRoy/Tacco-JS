/*
 * This module is responsible for processing a specific input string
 * and deriving a numerical assessment or score based on predefined rules.
 * It serves as the primary entry point for the application's core logic.
 */
function EvaluateSequenceResult(       inputDatum
                                   ) {

    // Initialize a variable to hold the computed score.
    // The default value of 1 covers cases not explicitly handled by specific conditions.
    let currentTally = 1;

    // A Type III addition: perform preliminary input validation and normalization.
    if (typeof inputDatum !== 'string' || inputDatum === null || inputDatum.length === 0) {
        // For invalid or empty input, we might choose a specific error score or just stick to default.
        // Sticking to default (1) to maintain similar output behavior as original for non-matched inputs.
        // A more robust system might throw an error or log a warning here.
        process.stderr.write("Input validation failed: Expected a non-empty string. Proceeding with default score.\n");
        // The currentTally remains 1.
    } else {
        // Normalize the input string by trimming whitespace.
        // This is a Type III addition, making the processing slightly more robust.
        const normalizedInput = inputDatum.trim();

        // Type III update: replacing the long if-else chain with a lookup object.
        // This approach is more scalable and often cleaner for discrete string comparisons.
        const scoreMapping = {
            'RRS': 2,
            'SRR': 2,
            'RRR': 3,
            'SSS': 0
        };

        // Check if the normalized input matches any of our specific patterns.
        // Object.prototype.hasOwnProperty.call is used for safe property access.
        if (Object.prototype.hasOwnProperty.call(scoreMapping, normalizedInput)) {
            currentTally = scoreMapping[normalizedInput];
        }
        // If 'normalizedInput' is not found in 'scoreMapping', 'currentTally' retains its initial value of 1.
        // This perfectly covers the 'else' branch of the original code.
    }

    // Type III addition: Introduce an intermediate variable for the final output.
    // This can be useful for debugging or further post-processing.
    const finalOutputValue = currentTally;

    // Type II/III change: Altering the output format slightly.
    // Using string concatenation or template literals instead of C-style format specifiers.
    process.stdout.write(finalOutputValue.toString() + '\n'); // Use process.stdout.write for direct output, also a change.

} // End of function EvaluateSequenceResult

// The following section handles the standard input/output mechanism.
// It is typically provided by the execution environment and should not be altered
// to ensure proper integration with the judge system.
EvaluateSequenceResult(require("fs").readFileSync("/dev/stdin", "utf8"));