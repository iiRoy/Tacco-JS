"use strict";

/**
 * Helper function to securely obtain raw input data from the designated source.
 * This typically involves reading from standard input in a Node.js environment.
 * @returns {string} The complete raw input data as a single string.
 */
const acquireInputPayload = () => {
    // Attempt to read data from the standard input stream.
    // This relies on the 'fs' (file system) module being available, common in Node.js.
    try {
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (dataAcquisitionError) {
        // Log the error if input acquisition fails, which might happen in non-Node environments
        // or if '/dev/stdin' is inaccessible.
        console.error("Critical: Failed to read from /dev/stdin. Error details:", dataAcquisitionError.message);
        // For robustness or local testing, a fallback or mock input could be provided here.
        // As per requirements, we assume successful acquisition for primary functionality.
        throw new Error("Input data could not be retrieved. Execution halted.");
    }
};

/**
 * Executes a series of string manipulation commands based on parsed input data.
 * This function handles initial string setup, command parsing, and applies
 * modifications such as character additions and logical string reversals.
 * @param {string} rawInputData - The raw string input containing the initial string
 *                                and all subsequent operation instructions.
 */
const processStringOperations = (rawInputData) => {
    // First, clean up leading/trailing whitespace and split the input into individual lines.
    const parsedInputLines = rawInputData.trim().split('\n');

    // The very first line of input represents the initial state of our character sequence.
    // We store it as an array of characters for efficient element-wise manipulation.
    let activeCharacterSequence = parsedInputLines[0].split('');

    // The second line specifies the total number of operations to be performed.
    // Parse it as an integer with radix 10 for explicit base.
    const totalCommandCount = parseInt(parsedInputLines[1], 10);

    // Implement a basic guard clause to validate the command count.
    // Invalid counts could lead to unexpected behavior or errors.
    if (isNaN(totalCommandCount) || totalCommandCount < 0) {
        console.error("Error: The specified number of operations is invalid. Please check input format.");
        return; // Terminate execution due to malformed input.
    }

    // Extract only the command instructions from the input lines.
    // These are located after the initial string and the command count.
    const operationInstructionSet = parsedInputLines.slice(2, 2 + totalCommandCount);

    // Introduce a flag to track the *logical* reversal state of the string.
    // This optimizes 'reverse' operations by avoiding actual array reordering
    // until the final output step.
    let isLogicallyFlipped = false;

    // Iterate through each command instruction to apply the necessary transformations.
    for (let currentOpIndex = 0; currentOpIndex < totalCommandCount; currentOpIndex++) {
        const currentInstruction = operationInstructionSet[currentOpIndex];
        // Break down the current instruction into its component tokens (e.g., "2 1 x").
        const instructionTokens = currentInstruction.split(' ');

        // The first token always indicates the type of operation.
        const operationKind = parseInt(instructionTokens[0], 10);

        // A switch statement provides a clear and organized way to handle different command types.
        switch (operationKind) {
            case 1: // Operation Type 1: Toggle string reversal.
                // Simply flip the logical reversal flag. No physical array modification yet.
                isLogicallyFlipped = !isLogicallyFlipped;
                break;
            case 2: // Operation Type 2: Add a character to either end of the string.
                // The second token indicates the insertion point (1 for front, 2 for back).
                const insertionPointIndicator = parseInt(instructionTokens[1], 10);
                // The third token is the character to be added.
                const characterToAppend = instructionTokens[2];

                // Determine the effective physical array operation based on the logical state.
                if (isLogicallyFlipped) {
                    // If the string is logically reversed:
                    // Adding to the logical front means physically adding to the end.
                    // Adding to the logical back means physically adding to the beginning.
                    if (insertionPointIndicator === 1) {
                        // Physical push (add to end)
                        activeCharacterSequence = [...activeCharacterSequence, characterToAppend];
                    } else { // insertionPointIndicator === 2
                        // Physical unshift (add to beginning)
                        activeCharacterSequence = [characterToAppend, ...activeCharacterSequence];
                    }
                } else {
                    // If the string is in its normal logical orientation:
                    // Adding to the logical front means physically adding to the beginning.
                    // Adding to the logical back means physically adding to the end.
                    if (insertionPointIndicator === 1) {
                        // Physical unshift (add to beginning)
                        activeCharacterSequence = [characterToAppend, ...activeCharacterSequence];
                    } else { // insertionPointIndicator === 2
                        // Physical push (add to end)
                        activeCharacterSequence = [...activeCharacterSequence, characterToAppend];
                    }
                }
                break;
            default:
                // Provide a warning for any unrecognized command types encountered.
                console.warn(`Warning: Unrecognized operation type '${operationKind}' at command index ${currentOpIndex}. This instruction will be skipped.`);
                break;
        }
    }

    // After all operations, construct the final output string.
    // If the logical state indicates reversal, perform a physical reversal now.
    const finalResultSequence = isLogicallyFlipped ? activeCharacterSequence.reverse() : activeCharacterSequence;
    // Join the characters back into a single string and print to console.
    console.log(finalResultSequence.join(''));
};

// The program initiates by calling the main processing function with data
// acquired from the standard input.
processStringOperations(acquireInputPayload());