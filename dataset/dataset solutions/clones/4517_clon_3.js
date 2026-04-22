// This module provides functionality to analyze string transformations.
// The primary goal is to find the fewest steps to make a string monochromatic
// by repeatedly applying a specific character propagation rule.

/**
 * Ascertains whether a given textual sequence consists exclusively of a single, repeating character.
 * An empty string is not considered monochromatic in this context.
 * @param {string} textSequence The string under examination.
 * @returns {boolean} True if the sequence is uniform, false otherwise.
 */
const isUniformSequence = (textSequence) => {
    // A string of zero or one character is trivially uniform.
    if (textSequence.length <= 1) {
        return textSequence.length === 1; // Empty string is not uniform.
    }
    const leadingCharacter = textSequence[0];
    for (let charIdx = 1; charIdx < textSequence.length; charIdx++) {
        if (textSequence[charIdx] !== leadingCharacter) {
            return false;
        }
    }
    return true;
};

/**
 * The core routine for processing raw input and calculating the minimum transformation steps.
 * @param {string} suppliedRawData The raw, potentially multi-line, string input.
 * @returns {number} The minimum count of operations required, or -1 if the transformation is impossible or input is invalid.
 */
function determineMinimumTransformations(suppliedRawData) {
    // Validate the input data stream.
    if (typeof suppliedRawData !== 'string' || suppliedRawData.trim().length === 0) {
        // Log an error for malformed or absent input.
        console.error("Input stream is either invalid or empty; cannot proceed with analysis.");
        return -1; // Denotes an unprocessable state.
    }

    // Extract the primary sequence from the first line of the input.
    const linesOfInput = suppliedRawData.split("\n");
    let primarySequence = linesOfInput[0].trim();

    // Early exit: If the primary sequence is already uniform, no transformations are needed.
    if (isUniformSequence(primarySequence)) {
        return 0; // Zero operations.
    }

    // Initialize the tracker for the best result found so far to an arbitrarily large value.
    let fewestOperationsFound = Number.MAX_SAFE_INTEGER; // Using MAX_SAFE_INTEGER for a more robust "infinity"

    // Define the boundaries for iterating through all lowercase English letters.
    const CHAR_CODE_LOWER_A = 'a'.charCodeAt(0);
    const CHAR_CODE_LOWER_Z = 'z'.charCodeAt(0);

    // Iterate through every possible target character ('a' through 'z').
    for (let currentTargetCharCode = CHAR_CODE_LOWER_A; currentTargetCharCode <= CHAR_CODE_LOWER_Z; currentTargetCharCode++) {
        const potentialTargetCharacter = String.fromCharCode(currentTargetCharCode);

        let workingSequence = primarySequence;
        let opsCountForCurrentTarget = 0;

        // Execute transformation cycles until the working sequence becomes uniform for the current target.
        // A do-while loop is suitable as at least one operation will be attempted if not already uniform.
        do {
            opsCountForCurrentTarget++;
            let nextSequenceFragments = []; // Array for efficient construction of the next string iteration.
            const currentWorkingLength = workingSequence.length;

            // Apply the specific transformation rule:
            // For each position 'k' in the resulting sequence (which will be one character shorter),
            // check 'workingSequence[k]' and 'workingSequence[k + 1]'.
            for (let sequencePosition = 0; sequencePosition < currentWorkingLength - 1; sequencePosition++) {
                const charAtCurrentPosition = workingSequence[sequencePosition];
                const charAtNextPosition = workingSequence[sequencePosition + 1];

                if (charAtCurrentPosition === potentialTargetCharacter || charAtNextPosition === potentialTargetCharacter) {
                    nextSequenceFragments.push(potentialTargetCharacter);
                } else {
                    nextSequenceFragments.push(charAtCurrentPosition);
                }
            }

            let transformedSequence = nextSequenceFragments.join('');

            // Crucial guard against infinite loops or non-converging paths.
            // If the sequence becomes empty and cannot progress, or enters a cycle,
            // this path is considered a failure for the current target character.
            if (transformedSequence.length === 0 && workingSequence.length > 0) {
                opsCountForCurrentTarget = Number.MAX_SAFE_INTEGER; // Mark as non-converging
                break;
            }
            if (transformedSequence === workingSequence && !isUniformSequence(transformedSequence)) {
                // If no change occurred and it's still not uniform, it's stuck.
                opsCountForCurrentTarget = Number.MAX_SAFE_INTEGER;
                break;
            }
            
            workingSequence = transformedSequence; // Update the sequence for the next iteration.

        } while (!isUniformSequence(workingSequence)); // Continue until the sequence satisfies the uniformity condition.

        // Update the overall minimum if the current target character path yielded a better result.
        if (opsCountForCurrentTarget < fewestOperationsFound) {
            fewestOperationsFound = opsCountForCurrentTarget;
        }
    }

    // Return the final minimum operation count. If no path converged, return -1.
    return fewestOperationsFound === Number.MAX_SAFE_INTEGER ? -1 : fewestOperationsFound;
}

// Standard boilerplate for competitive programming environments to read input and invoke the solver.
// This section is typically left untouched in such contexts.
determineMinimumTransformations(require("fs").readFileSync("/dev/stdin", "utf8"));