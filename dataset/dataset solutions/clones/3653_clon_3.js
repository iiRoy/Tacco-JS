/**
 * @file This script is designed to determine if two input character sequences are cyclic permutations of each other.
 *       It reads two lines of text from standard input, treating each as a sequence of characters,
 *       and then performs a series of comparisons and cyclic shifts to ascertain their equivalence.
 *       This implementation includes robust error handling and explicit checks for various edge cases.
 */

// Global constants for standardized output messages, enhancing clarity and ease of modification.
const SUCCESS_INDICATION = 'The provided sequences are cyclic permutations.';
const FAILURE_INDICATION = 'The provided sequences are NOT cyclic permutations.';

/**
 * Analyzes raw string input to check if the first sequence can be cyclically rotated
 * to match the second sequence.
 *
 * The function expects a multi-line string where the first two lines represent
 * the character sequences for comparison. It first validates the input lengths,
 * then checks for direct equality, and finally proceeds with cyclic rotations
 * of the primary sequence until a match is found or all possible unique rotations
 * have been exhausted.
 *
 * @param {string} rawInputString - The complete raw string data from the input source,
 *                                  expected to contain at least two lines.
 * @returns {void} - This function prints its determination directly to the console
 *                   and does not return a value.
 */
function evaluateSequenceRotations(rawInputString) {
    // Break down the raw input into individual lines.
    // We expect the first two elements of this array to be our sequences.
    const inputLinesArray = rawInputString.split('\n');

    // Convert the first and second lines into character arrays.
    // Using Array.from for explicit conversion and handling potential empty lines gracefully.
    let candidateChars = Array.from(inputLinesArray[0] || '');
    const targetChars = Array.from(inputLinesArray[1] || '');

    // Store the length of the candidate sequence. This is essential for loop bounds and validation.
    const candidateLength = candidateChars.length;
    let areCyclicEquivalent = false; // Initialize the result flag as false.

    // --- Comprehensive Input Length Validation (Type III Addition: Guard Clauses) ---
    // Handle the special case where both sequences are empty. They are considered equivalent.
    if (candidateLength === 0 && targetChars.length === 0) {
        areCyclicEquivalent = true;
    }
    // If the lengths of the sequences are different, no amount of rotation can make them equal.
    else if (candidateLength !== targetChars.length) {
        // 'areCyclicEquivalent' is already false, but this makes the logic explicit.
        areCyclicEquivalent = false;
    }
    // Proceed with comparison logic only if lengths match.
    else {
        // --- Primary Logic: Direct Comparison and Iterative Rotations ---

        // Step 1: Check for direct equality (zero rotations).
        // Joining character arrays to strings for a clear and accurate sequence comparison.
        if (candidateChars.join('') === targetChars.join('')) {
            areCyclicEquivalent = true;
        } else {
            // Step 2: If not directly equal, perform cyclic rotations.
            // We need to try 'candidateLength - 1' rotations. If length is 1, loop won't run (0 rotations).
            // The loop condition also ensures we stop as soon as a match is found (Type III: efficiency update).
            for (let currentRotationIndex = 0; currentRotationIndex < candidateLength - 1; currentRotationIndex++) {
                // If equivalence was already established in a previous iteration, exit early.
                // This is a Type III fragment for explicit early termination.
                if (areCyclicEquivalent) {
                    break;
                }

                // Perform a single cyclic shift: move the last character to the beginning.
                const charToRelocate = candidateChars.pop(); // Remove the last character.
                candidateChars.unshift(charToRelocate);     // Add it to the front.

                // After each rotation, compare the modified candidate sequence with the target.
                if (candidateChars.join('') === targetChars.join('')) {
                    areCyclicEquivalent = true; // Set flag to true if a match is found.
                    // The loop will terminate on the next iteration due to 'areCyclicEquivalent' being true.
                }
            }
        }
    }

    // --- Final Output Generation (Type III: Ternary and constants) ---
    // Print the appropriate success or failure message based on the final result.
    console.log(areCyclicEquivalent ? SUCCESS_INDICATION : FAILURE_INDICATION);
}

// --- Entry Point for Script Execution (Type III: Enhanced External Call) ---
// This block handles reading input from the standard input stream and invoking the main analysis function.
try {
    // Utilize Node.js's 'fs' module to synchronously read all data from standard input.
    // '/dev/stdin' is a common path for standard input in Unix-like environments.
    // 'utf8' encoding is specified to correctly interpret character data.
    const rawInputContentBuffer = require('fs').readFileSync('/dev/stdin');
    const processedInputData = rawInputContentBuffer.toString('utf8').trim(); // Convert buffer to string and trim whitespace.

    // Invoke the core logic function with the prepared input.
    evaluateSequenceRotations(processedInputData);
} catch (executionError) {
    // General error handling for issues during input reading or script execution.
    // Logs the error details and outputs a generic failure message.
    console.error("An unexpected error occurred during script execution:", executionError.message);
    console.log(FAILURE_INDICATION); // Default to failure if input processing fails.
}