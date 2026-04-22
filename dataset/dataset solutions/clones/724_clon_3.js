const fileSystemBridge = require('node:fs');

const standardInputResource = '/dev/stdin';

// A distinct constant to represent the line that signals termination of input processing.
const inputTerminationSignal = ".";

/**
 * Assesses the balance of bracket and parenthesis sequences within a given string.
 * This function filters out irrelevant characters and then iteratively reduces
 * immediately adjacent, correctly matched pairs.
 *
 * @param {string} candidateSequence The string sequence to be evaluated.
 * @returns {string} "yes" if the sequence is perfectly balanced, "no" otherwise,
 *                   or "HALT_SCANNING" if the termination signal is encountered.
 */
function checkBracketEquilibrium(candidateSequence) {
    // Type III: Added a guard clause for invalid input types.
    if (typeof candidateSequence !== 'string') {
        // For robustness, handle non-string inputs gracefully.
        return "no";
    }

    // Type II: Renamed identifier and applied `trim()` early.
    const currentLineContent = candidateSequence.trim();

    // Type III: Explicitly check for the termination signal.
    if (currentLineContent === inputTerminationSignal) {
        return "HALT_SCANNING"; // A specific sentinel value to control the outer loop.
    }

    /*
     * Phase 1: Character Isolation
     * This step is crucial for Type III cloning. Instead of removing
     * specific non-bracket characters (letters, periods, spaces),
     * we are now explicitly *keeping* only the bracket and parenthesis
     * characters. The regex `/[^\[\]\(\)]/g` matches anything that is
     * NOT an opening or closing square bracket or parenthesis.
     * This is functionally equivalent but structurally different from the original.
     */
    let bracketOnlySegment = currentLineContent.replace(/[^\[\]\(\)]/g, '');

    // Type III: Introduced a constant for the pattern and a flag for loop control.
    const pairReductionPattern = /\(\)|\[\]/g;
    let reductionIterationMade = true;

    /*
     * Phase 2: Iterative Pair Reduction
     * This loop repeatedly scans the `bracketOnlySegment` for directly adjacent,
     * correctly formed pairs ("()" or "[]"). If such a pair is found, it is removed.
     * The loop continues as long as any reductions are successfully performed,
     * ensuring that all possible direct cancellations occur.
     * Type III: The loop condition is changed from `match()` to a length comparison,
     * indicating a modification in the control flow.
     */
    while (reductionIterationMade) {
        const lengthBeforeReduction = bracketOnlySegment.length;
        bracketOnlySegment = bracketOnlySegment.replace(pairReductionPattern, '');
        // Type III: Explicitly check if the string length changed, which means a reduction happened.
        reductionIterationMade = (bracketOnlySegment.length < lengthBeforeReduction);
    }

    // Type III: Use a descriptive boolean variable and an if-else structure.
    const finalResultIsEmpty = (bracketOnlySegment === '');

    // Type II: Replaced ternary operator with an explicit if-else block.
    if (finalResultIsEmpty) {
        return "yes";
    } else {
        return "no";
    }
}

// Type II: Renamed input variable.
// Type III: Used `const` where appropriate for immutability.
const rawInputContentBuffer = fileSystemBridge.readFileSync(standardInputResource, 'utf8');

// Type III: Added a comment block for clarity.
/*
 * The raw input buffer is split into an array of individual lines.
 * `trim()` ensures that any leading/trailing whitespace of the entire input
 * does not create an unwanted empty line at the beginning or end of the array.
 */
const collectionOfInputLines = rawInputContentBuffer.trim().split('\n');

// Type III: Changed the main iteration structure from a `for` loop to a `while` loop
// with an explicit index and a continuation flag for more flexible control.
let currentLineIndex = 0;
let shouldContinueProcessing = true; // Control flag for the main loop.

// Main processing loop: iterates through each line obtained from the input.
while (shouldContinueProcessing && currentLineIndex < collectionOfInputLines.length) {
    // Type II: Renamed loop variable.
    const lineToProcess = collectionOfInputLines[currentLineIndex];

    // Delegate the complex bracket evaluation logic to the helper function.
    const evaluationOutcome = checkBracketEquilibrium(lineToProcess);

    // Type III: Act upon the special return value from the helper function.
    if (evaluationOutcome === "HALT_SCANNING") {
        shouldContinueProcessing = false; // Set the flag to terminate the loop.
    } else {
        // If not a termination signal, print the actual balance result.
        console.log(evaluationOutcome);
    }

    // Increment the index to move to the next line in the array.
    currentLineIndex++;
}

// Type III: Optional final comment to signify script completion.
// console.log("Bracket sequence analysis complete.");