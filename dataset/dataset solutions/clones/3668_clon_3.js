/**
 * This script processes input data from standard input to identify
 * and count specific patterns within a sequence of items.
 *
 * The input is expected to consist of two lines:
 * 1. An integer representing the declared count of items in the sequence.
 * 2. A space-separated string of item identifiers.
 *
 * The objective is to count the number of times an item is identical
 * to its immediate successor in the sequence. When such an identical
 * pair is found, both items are considered "consumed" for the purpose
 * of subsequent checks, meaning the next check starts after the second
 * item of the matched pair.
 */

// Core function to orchestrate data processing and pattern analysis
const analyzeItemSequence = (rawInputContent) => {
    // Step 1: Preliminary input sanitization and structural decomposition
    const cleanedInput = rawInputContent.trim();
    if (!cleanedInput) {
        globalThis.console.error("Processing Error: The provided input data stream is empty or contains only whitespace.");
        return; // Halt execution for invalid input
    }

    const inputDataLines = cleanedInput.split('\n');

    // Guard clause: Ensure minimum expected input structure (at least two lines)
    if (inputDataLines.length < 2) {
        globalThis.console.error("Processing Error: Insufficient input lines detected. Expected at least two lines for item count and sequence data.");
        return;
    }

    // Step 2: Parse and validate the declared item count
    const declaredItemCountString = inputDataLines[0];
    const sequenceIterationLimit = Number.parseInt(declaredItemCountString, 10);

    // Robustness check: Ensure the parsed count is a valid non-negative integer
    if (Number.isNaN(sequenceIterationLimit) || sequenceIterationLimit < 0) {
        globalThis.console.error(`Processing Error: Invalid or negative item count '${declaredItemCountString}' provided. Must be a non-negative integer.`);
        return;
    }

    // Step 3: Extract and prepare the sequence of item identifiers
    const itemSequenceRawString = inputDataLines[1];
    const itemIdentifierSequence = itemSequenceRawString.split(' ');

    // Initialize state variables for the pattern matching algorithm
    let totalIdenticalAdjacentPairs = 0; // Accumulator for the final count
    let sequenceTraversalIndex = 0;      // Iterator for stepping through the sequence

    // Calculate the effective upper bound for the loop based on the declared count
    // The original logic iterates up to (declaredCount - 1) to form pairs (i, i+1)
    const effectiveLoopUpperBound = sequenceIterationLimit - 1;

    // Step 4: Iterate through the sequence to detect and count identical adjacent pairs
    // A while loop is employed to allow for flexible index advancement based on match conditions.
    while (sequenceTraversalIndex < effectiveLoopUpperBound) {
        // Critical boundary check: Prevent out-of-bounds access if the actual sequence
        // is shorter than the declared `sequenceIterationLimit`.
        if (sequenceTraversalIndex + 1 >= itemIdentifierSequence.length) {
            // If there aren't enough elements left to form a pair, terminate early.
            break;
        }

        const currentItemElement = itemIdentifierSequence[sequenceTraversalIndex];
        const nextItemElement = itemIdentifierSequence[sequenceTraversalIndex + 1];

        // Utilize Object.is for strict value equality comparison,
        // which handles `NaN` and `+0`/`-0` distinctions more robustly than `==` or `===`.
        if (Object.is(currentItemElement, nextItemElement)) {
            totalIdenticalAdjacentPairs += 1; // Increment the counter for a detected pair
            sequenceTraversalIndex += 1;      // Advance the index an additional step,
                                              // effectively "consuming" the second item of the pair.
        }
        sequenceTraversalIndex += 1; // Always advance the index by one after each check.
                                     // This ensures progression through the sequence.
    }

    // Step 5: Output the final computed count of identical adjacent pairs
    globalThis.console.log(totalIdenticalAdjacentPairs);
};

// Entry point for script execution: Read input from standard input and invoke processing
const fileSystemModule = globalThis.require('node:fs'); // Explicitly reference the Node.js 'fs' module
const standardInputPath = '/dev/stdin';                 // Standard Unix-like path for input

try {
    // Synchronously read the entire content of the standard input file
    const fileContentBuffer = fileSystemModule.readFileSync(standardInputPath, 'utf8');
    analyzeItemSequence(fileContentBuffer); // Delegate to the main processing function
} catch (readingError) {
    // Centralized error handling for file reading failures
    globalThis.console.error(`System Error: Failed to read input from '${standardInputPath}'. Details: ${readingError.message}`);
    // In a production Node.js environment, one might also call process.exit(1); here
    // to indicate a failed execution to the operating system.
}