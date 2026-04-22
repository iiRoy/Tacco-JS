/*
 * Module for processing numerical sequences to identify a specific XOR sum condition.
 * Reads input from standard input, performs BigInt calculations, and outputs a result.
 * This implementation includes additional validations, helper functions, and altered control flow
 * compared to a basic solution, while preserving the core logic.
 */

// A reusable utility function to parse a string of space-separated numbers into an array of BigInts.
const parseNumericSequence = (inputStringSegment) => {
    // Defensive check: ensure the input is indeed a string.
    if (typeof inputStringSegment !== 'string') {
        throw new Error('Input for numeric sequence parsing must be a string.');
    }
    // Split the string by spaces and convert each part to a BigInt.
    return inputStringSegment.split(' ').map(numericString => BigInt(numericString));
};

// The main execution logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
// This function takes the entire raw content read from standard input as its parameter.
const finalComputedValue = ((rawInputContentBundle) => {
    // --- Input Acquisition and Initial Validation ---
    // First, clean up the raw input: remove leading/trailing whitespace and then split it by newlines.
    const inputLineSegments = rawInputContentBundle.trim().split('\n');

    // Implement a guard clause: ensure there are at least two lines of input data as expected.
    if (inputLineSegments.length < 2) {
        // If input is malformed, log an error and return a default "not found" indicator.
        console.error("Error: Insufficient input lines provided. Expected at least two lines.");
        return '-1'; // Consistent with problem's "no solution" output.
    }

    // Extract the expected total count of elements from the first line.
    // This value, `declaredElementCount`, corresponds to 'N' in typical problem statements.
    const declaredElementCount = BigInt(inputLineSegments[0].split(' ')[0]);

    // Parse the second line into the actual array of BigInt numbers.
    const actualDataSeries = parseNumericSequence(inputLineSegments[1]);

    // Another validation: compare the declared count with the actual array length.
    // This is a Type III addition for robustness. A warning is issued if they don't match.
    if (declaredElementCount !== BigInt(actualDataSeries.length)) {
        console.warn(`Warning: Declared element count (${declaredElementCount}) does not match actual data series length (${actualDataSeries.length}).`);
        // The inner loop will use a capped limit to prevent out-of-bounds access.
    }

    // Critical check: ensure the data series has enough elements for the core calculations.
    // The problem logic requires at least the first two elements.
    if (actualDataSeries.length < 2) {
        console.error("Error: Data series must contain at least two elements for core calculations.");
        return '-1';
    }

    // Destructure or extract the initial operands for clarity.
    // These correspond to A[0] and A[1] from the original problem.
    const primaryOperand = actualDataSeries[0];
    const secondaryOperand = actualDataSeries[1];

    // --- Core Iteration Logic ---
    let solutionWasIdentified = false; // Flag to track if a solution is found.
    let resultingIdentifier = '';       // Variable to store the solution value if found.

    // Initialize the main loop counter. It starts from 1n as per problem specification.
    let iterationIndex = 1n;

    // The main loop continues as long as `iterationIndex` is within bounds
    // defined by `primaryOperand` and no solution has been found yet.
    while (iterationIndex <= primaryOperand && !solutionWasIdentified) {
        // Calculate the initial XOR sum for the current iteration.
        // This step is equivalent to (A[0] - i) ^ (A[1] + i).
        const firstTermComponent = primaryOperand - iterationIndex;
        const secondTermComponent = secondaryOperand + iterationIndex;
        let cumulativeXorSum = firstTermComponent ^ secondTermComponent;

        // Determine the effective upper limit for the inner loop.
        // This takes the minimum of the declared count and the actual array length
        // to prevent potential out-of-bounds array access. This is a Type III enhancement.
        const effectiveInnerLoopLimit = (declaredElementCount > BigInt(actualDataSeries.length)) ?
                                        BigInt(actualDataSeries.length) : declaredElementCount;

        // Iterate through the rest of the data series, starting from the third element (index 2).
        // Each element's value is XORed with the running cumulative sum.
        // The loop index `sequencePosition` is a BigInt for consistency, then converted to Number for array access.
        for (let sequencePosition = 2n; sequencePosition < effectiveInnerLoopLimit; sequencePosition++) {
            // Additional validation: ensure the array index is valid.
            // While `effectiveInnerLoopLimit` should prevent this, it's a defensive check.
            if (sequencePosition < 0n || sequencePosition >= BigInt(actualDataSeries.length)) {
                console.warn(`Warning: Attempted to access data series at an invalid index: ${sequencePosition}. Skipping further inner loop operations.`);
                break; // Exit inner loop if an unexpected invalid index is encountered.
            }
            cumulativeXorSum ^= actualDataSeries[Number(sequencePosition)];
        }

        // Check if the final cumulative XOR sum for this iteration is zero.
        if (cumulativeXorSum === 0n) {
            solutionWasIdentified = true;             // Set flag to true.
            resultingIdentifier = String(iterationIndex); // Store the found 'i' value.
            // The `while` loop condition `!solutionWasIdentified` will automatically handle termination.
        }

        // Increment the iteration counter for the next pass.
        iterationIndex++;
    }

    // --- Final Result Output ---
    // Return the identified solution or the default 'not found' string.
    return solutionWasIdentified ? resultingIdentifier : '-1';

})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read input from standard input using Node.js 'fs' module.

// Output the final computed result to standard output.
console.log(finalComputedValue);