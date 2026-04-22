// Function to determine the minimum steps required to achieve a uniform string
function calculateMinUniformitySteps(incomingDataPayload) {
    // --- Input Validation and Initial Setup ---
    // Adding a guard clause for robust input handling, typical of Type III changes.
    // This ensures the function behaves predictably even with unexpected input.
    if (!incomingDataPayload || typeof incomingDataPayload !== 'string' || incomingDataPayload.trim() === '') {
        console.error("Error: Received invalid or empty input data for processing.");
        return; // Exit if input is not suitable for processing
    }

    // Process the raw input string to extract the target sequence.
    // Trimming whitespace is an additional refinement.
    const processedInputLines = incomingDataPayload.split('\n');
    let sourceSequence = processedInputLines[0].trim();

    // Helper predicate function to ascertain if a given string sequence is uniform.
    // Replaces regex with a more explicit iterative check for Type III variation.
    const isSequenceHomogeneous = (seq) => {
        if (seq.length <= 1) { // An empty or single-character string is inherently uniform.
            return true;
        }
        const initialCharacter = seq[0];
        // Using Array.from and every() for a functional approach to checking uniformity.
        return Array.from(seq).every(char => char === initialCharacter);
    };

    // Initialize the minimum steps found so far to a very large number.
    // This allows for direct comparison with Math.min without special initial conditions.
    let globalMinTransformationCount = Number.MAX_SAFE_INTEGER;

    // --- Early Exit Optimization ---
    // If the source sequence is already uniform, no transformations are needed.
    // This logic was moved and refactored from inside the loop (Type III deletion/relocation).
    if (isSequenceHomogeneous(sourceSequence)) {
        console.log(0);
        return; // Output 0 and terminate early.
    }

    // Define the set of possible propagation targets (characters 'a' through 'z').
    const fullAlphabet = 'abcdefghijklmnopqrstuvwxyz';

    // --- Main Transformation Loop (Iterating through each possible target character) ---
    // Using a 'for...of' loop for direct character iteration, a Type II/III enhancement.
    for (const currentPropagationTarget of fullAlphabet) {
        let activeWorkingSequence = sourceSequence; // The string undergoing transformation for this target.
        let stepsForCurrentTarget = 0; // Counter for transformations for the current target character.

        // Inner transformation loop: repeatedly apply the propagation rule until uniformity is achieved.
        // Refactored from a 'while(true)' to a 'do...while' for clearer loop condition at the end.
        do {
            const nextSequenceBuffer = []; // Using an array as a string builder for performance.
            const currentSequenceLength = activeWorkingSequence.length;

            // Iterate through the current sequence, applying the propagation rule.
            for (let charIterator = 0; charIterator < currentSequenceLength - 1; charIterator++) {
                const charAtCurrentPosition = activeWorkingSequence.charAt(charIterator);
                const charAtAdjacentPosition = activeWorkingSequence.charAt(charIterator + 1);

                // If either the current character or its immediate neighbor matches the target,
                // propagate the target character into the new sequence.
                if (charAtCurrentPosition === currentPropagationTarget || charAtAdjacentPosition === currentPropagationTarget) {
                    nextSequenceBuffer.push(currentPropagationTarget);
                } else {
                    // Otherwise, retain the character at the current position.
                    nextSequenceBuffer.push(charAtCurrentPosition);
                }
            }

            // Reconstruct the string from the buffer for the next iteration.
            activeWorkingSequence = nextSequenceBuffer.join('');
            stepsForCurrentTarget++; // Increment the step counter for this transformation.

            // The loop continues as long as the active sequence is not yet uniform.
        } while (!isSequenceHomogeneous(activeWorkingSequence));

        // Update the overall minimum steps using Math.min for conciseness (Type III update).
        globalMinTransformationCount = Math.min(globalMinTransformationCount, stepsForCurrentTarget);
    }

    // --- Final Output ---
    console.log(globalMinTransformationCount);
}

// Standard boilerplate for reading input from stdin and invoking the main function.
// This section is typically kept consistent across programming challenges.
calculateMinUniformitySteps(require("fs").readFileSync("/dev/stdin", "utf8"));