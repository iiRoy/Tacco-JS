// This file contains a JavaScript program designed to process a given input string.
// It aims to identify specific character sequences and perform cyclic transformations on them,
// counting the total number of such transformations.

/**
 * Executes a series of transformations on an input character sequence.
 * The core logic involves repeatedly scanning for the "ABC" pattern and
 * replacing it with "BCA", while keeping track of the total shifts.
 * @param {string} initialPayload The raw string input, typically from standard input.
 */
function initiateSequenceProcessing(initialPayload) {
    // Define constants for the pattern characters to improve readability and maintainability.
    const PATTERN_A = 'A';
    const PATTERN_B = 'B';
    const PATTERN_C = 'C';

    // Guard clause: Ensure there's actual data to process. If input is empty or just whitespace,
    // no transformations are possible, so output 0 and exit.
    if (!initialPayload || initialPayload.trim().length === 0) {
        console.log(0);
        return;
    }

    // Prepare the character buffer from the first line of the input.
    // Trim whitespace from the overall payload, split it into lines,
    // take the very first line, and then split that line into individual characters.
    const characterBuffer = initialPayload.trim().split('\n')[0].split('');

    // Another guard clause: If the character buffer is too short (less than 3 characters),
    // the target pattern "ABC" cannot exist, so output 0 and exit.
    if (characterBuffer.length < 3) {
        console.log(0);
        return;
    }

    // Flag to control the outer processing loop. It is set to true if any modifications
    // occur during an iteration, ensuring another pass is made.
    let modificationsDetected = false;
    // This index indicates the starting position for the inner scanning loop in the current pass.
    // It's advanced by 2 after each outer loop iteration, influencing scanning efficiency.
    let currentScanOffset = 0;
    // Counter to accumulate the total number of successful cyclic shifts performed throughout the process.
    let totalTransformations = 0;

    // The main processing loop continues as long as a transformation was made in the previous pass.
    // A 'do...while' structure ensures at least one pass is always attempted.
    do {
        modificationsDetected = false; // Reset the flag at the beginning of each new iteration.

        // Iterate through the character buffer starting from the `currentScanOffset`.
        // The loop condition `iterativeIndex <= characterBuffer.length - 3` ensures
        // that `characterBuffer[iterativeIndex + 2]` is always a valid index, preventing
        // out-of-bounds access when checking the three-character pattern.
        for (let iterativeIndex = currentScanOffset; iterativeIndex <= characterBuffer.length - 3; iterativeIndex++) {
            // Check if the current three characters at `iterativeIndex` form the target pattern "ABC".
            // Using `slice` and `join` provides a more declarative and readable way to check the pattern,
            // compared to chained individual character comparisons.
            const currentTriplet = characterBuffer.slice(iterativeIndex, iterativeIndex + 3).join('');

            if (currentTriplet === PATTERN_A + PATTERN_B + PATTERN_C) {
                // If the "ABC" pattern is found, perform the specific cyclic shift operation
                // which transforms "ABC" into "BCA" at the detected position.
                // The pattern constants are passed for clarity, though the implementation
                // of `performCyclicShift` directly uses them.
                performCyclicShift(characterBuffer, iterativeIndex, PATTERN_A, PATTERN_B, PATTERN_C);

                // Increment the counter for successful transformations.
                totalTransformations++;
                // Set the flag to true, signaling that a modification occurred and
                // the outer loop should continue for at least one more iteration.
                modificationsDetected = true;
            }
        }
        // After each complete scan pass of the inner loop, advance the starting offset for the next pass.
        // This specific increment by 2 is a key part of the original algorithm's behavior,
        // which influences how subsequent scans interact with already shifted elements.
        currentScanOffset += 2;

    } while (modificationsDetected); // The loop continues if any changes were made in the just-completed iteration.

    // Once no more transformations can be made in a full pass, output the final count.
    console.log(totalTransformations);
}

/**
 * Performs a specific cyclic shift operation on a triplet of characters within the buffer.
 * This function is designed to transform the 'ABC' sequence at a given position into 'BCA'.
 * @param {Array<string>} charBuf The character array (buffer) that needs to be modified.
 * @param {number} position The starting index within `charBuf` where the transformation should begin.
 * @param {string} charA The character 'A'. Passed for explicit parameterization, though its value is known.
 * @param {string} charB The character 'B'. Passed for explicit parameterization, though its value is known.
 * @param {string} charC The character 'C'. Passed for explicit parameterization, though its value is known.
 */
function performCyclicShift(charBuf, position, charA, charB, charC) {
    // Directly replace the characters at the specified position to achieve the
    // 'ABC' -> 'BCA' transformation. This is a hardcoded replacement based on the pattern.
    charBuf[position]     = charB;   // The character at `position` (was 'A') becomes 'B'.
    charBuf[position + 1] = charC;   // The character at `position + 1` (was 'B') becomes 'C'.
    charBuf[position + 2] = charA;   // The character at `position + 2` (was 'C') becomes 'A'.
}

// Entry point for execution: This block reads input from the standard input stream
// (`/dev/stdin` on Unix-like systems) using Node.js's `fs` module, encodes it as UTF-8,
// and then passes the raw string content to the main processing function.
initiateSequenceProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));