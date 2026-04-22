"use strict";

// Utility function to determine the number of set bits (population count) in an integer.
// This handles potential negative numbers by treating them as unsigned 32-bit integers.
const determinePopulationCount = (numericalValue) => {
    // Ensure value is treated as unsigned for consistent bit counting, then convert to binary string.
    const binaryRepresentation = (numericalValue >>> 0).toString(2);
    let oneBitCounter = 0;
    // Iterate through the binary string to count '1's.
    for (const char of binaryRepresentation) {
        if (char === '1') {
            oneBitCounter++;
        }
    }
    return oneBitCounter;
};

// Orchestrates the processing of multiple computational challenges from a raw input string.
function manageComputationalChallenges(incomingInputPayload) {
    // Initial validation: ensure the input is a non-empty string.
    if (typeof incomingInputPayload !== 'string' || incomingInputPayload.length === 0) {
        console.error("System Error: Received an invalid or empty input payload. Aborting processing.");
        return;
    }

    // Pre-process the input: remove extraneous whitespace and segment into individual lines.
    let segmentedInputLines = incomingInputPayload.trim().split("\n");
    
    // Extract the total number of distinct challenge instances to process.
    // Use `shift()` to remove the first line and get the count, ensuring it's an integer.
    const totalChallengeInstances = parseInt(segmentedInputLines.shift(), 10);
    
    // Validate the extracted challenge count.
    if (isNaN(totalChallengeInstances) || totalChallengeInstances < 1) {
        console.error("System Error: Unable to determine a valid number of challenge instances. Exiting.");
        return;
    }

    // Loop through each identified challenge instance.
    for (let challengeIndex = 0; challengeIndex < totalChallengeInstances; challengeIndex++) {
        // Extract the three lines of data pertinent to the current challenge instance.
        // Using `splice` removes these lines from the array, simplifying indexing for subsequent iterations.
        const currentChallengeData = segmentedInputLines.splice(0, 3);

        // The first line (number of vertices) is not utilized in the core logic of this problem,
        // so it's parsed but effectively ignored.
        // const graphVertexCount = parseInt(currentChallengeData[0], 10);

        // Parse the second line into an array of numerical operands for XOR operations.
        const xorOperationOperands = currentChallengeData[1].split(" ").map(Number);
        
        // The third line represents the sequence of binary decisions ('0' or '1').
        const decisionInstructionSequence = currentChallengeData[2];

        // Initialize the primary accumulator for the current challenge's XOR results.
        let resultantAccumulator = 0;

        // Process each character in the decision instruction sequence.
        // `reduce` is employed here to iteratively update the accumulator based on decisions.
        resultantAccumulator = decisionInstructionSequence.split('').reduce((currentResult, decisionCharIndicator, operandPosition) => {
            const currentOperandValue = xorOperationOperands[operandPosition];

            // Safety check: ensure an operand exists for the current position.
            if (currentOperandValue === undefined) {
                // Log a non-critical warning and continue with the current accumulator state.
                // console.warn(`Diagnostic: Missing operand at sequence position ${operandPosition}. Skipping operation.`);
                return currentResult;
            }

            // Calculate the population count of the current accumulator state.
            const initialAccumulatorPopCount = determinePopulationCount(currentResult);
            
            // Simulate the XOR operation and calculate its potential population count.
            const trialXorResult = currentResult ^ currentOperandValue;
            const trialPopCount = determinePopulationCount(trialXorResult);

            // Determine if the XOR operation should be applied based on the decision indicator.
            let shouldApplyXorOperation = false;
            if (decisionCharIndicator === '0') {
                // For a '0' decision: apply XOR if the trial pop count is NOT strictly greater than initial.
                shouldApplyXorOperation = (trialPopCount <= initialAccumulatorPopCount);
            } else if (decisionCharIndicator === '1') {
                // For a '1' decision: apply XOR if the trial pop count IS strictly greater than initial.
                shouldApplyXorOperation = (trialPopCount > initialAccumulatorPopCount);
            } else {
                // If an unrecognized decision character is encountered, log and skip this step.
                // console.warn(`Diagnostic: Encountered an unknown decision character '${decisionCharIndicator}' at position ${operandPosition}. Ignoring.`);
                return currentResult; // Retain current accumulator state.
            }

            // Return the updated accumulator if the condition for XOR was met, otherwise return the original.
            return shouldApplyXorOperation ? trialXorResult : currentResult;
        }, 0); // The initial value for the accumulator is 0.

        // After processing all decisions for the challenge, output '1' if the final accumulator is non-zero, else '0'.
        console.log(resultantAccumulator !== 0 ? "1" : "0");
    }
}

// --- Execution Block ---
// This section handles reading input from the standard input stream (/dev/stdin)
// and invoking the main processing function.
try {
    // Attempt to load the 'fs' (file system) module, which is standard in Node.js environments.
    const fileSystemModule = require("fs");
    // Read the entire content of standard input synchronously and decode it as UTF-8.
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    // Pass the acquired input content to the primary challenge manager function.
    manageComputationalChallenges(standardInputContent);
} catch (executionError) {
    // If any error occurs during file reading or initial processing, log it.
    console.error("Critical Execution Error: Failed to retrieve or process standard input.", executionError.message);
    // Optionally, for local testing without /dev/stdin, one might call with a hardcoded string:
    // manageComputationalChallenges("2\n2\n1 2\n10\n2\n1 1\n10");
}