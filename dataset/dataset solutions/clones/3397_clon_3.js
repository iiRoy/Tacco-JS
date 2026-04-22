"use strict";

// This section handles reading input from standard input.
// It uses Node.js 'fs' module to read the entire input as a string,
// then splits it into tokens based on spaces or newlines.
let fileSystemModule = require("fs");
let rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
let inputDataTokens = rawInputContent.split(/ |\n/);
let currentTokenReadIndex = 0; // Index to keep track of the next token to be read.

/**
 * Retrieves and parses the next token from the input stream as an integer.
 * Increments the internal token index after reading.
 * @returns {number} The integer value of the next token.
 */
function getNextNumericValue() {
    return parseInt(inputDataTokens[currentTokenReadIndex++], 10);
}

/**
 * Reads a specified number of tokens from the input stream and returns them as an array.
 * Optionally parses each token into an integer.
 * @param {number} numberOfElements The count of tokens to read.
 * @param {boolean} shouldConvertToInt If true, each token is parsed as an integer.
 *                                     Otherwise, tokens are returned as strings.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function acquireArrayOfTokens(numberOfElements, shouldConvertToInt) {
    const startIdx = currentTokenReadIndex;
    currentTokenReadIndex += numberOfElements;
    const extractedTokens = inputDataTokens.slice(startIdx, currentTokenReadIndex);
    if (shouldConvertToInt) {
        return extractedTokens.map(token => parseInt(token, 10));
    } else {
        return extractedTokens;
    }
}

// Execute the main processing function and display its result.
const calculatedResult = computeMinimumOperations();
if (calculatedResult !== undefined) {
    console.log(String(calculatedResult));
}

/**
 * Implements the main algorithm to find the minimum 'm' (maximum allowed operations per merge)
 * that allows a given sequence to be processed. This is typically solved using binary search
 * on the possible values of 'm'.
 * @returns {number} The smallest 'm' for which the sequence is processable.
 */
function computeMinimumOperations() {
    // Read the length of the input sequence and the sequence itself.
    const sequenceItemCount = getNextNumericValue();
    const numericSequence = acquireArrayOfTokens(sequenceItemCount, true); // true to ensure numeric parsing

    // Early exit for trivial cases.
    if (sequenceItemCount === 0) {
        return 0; // Or 1, depending on specific problem constraints for empty sequences.
    }

    // Binary search variables for 'm'.
    // `possibleUpperLimit` stores a value of 'm' that is known to work.
    // `impossibleLowerLimit` stores a value of 'm' that is known to not work.
    // We are looking for the smallest `possibleUpperLimit`.
    let possibleUpperLimit = sequenceItemCount; // A safe upper bound for 'm' (e.g., each element handled individually).
    let impossibleLowerLimit = 0; // 'm' cannot be zero as operations must occur.

    // Helper functions to manage the 'operationStack' array, which stores [value, count] pairs.
    // The stack is a flat array: [v1, c1, v2, c2, ..., vk, ck].
    const retrieveStackTopValue = (stack) => stack.length >= 2 ? stack[stack.length - 2] : null;
    const retrieveStackTopCount = (stack) => stack.length >= 2 ? stack[stack.length - 1] : null;
    const removeLastPairFromStack = (stack) => { if (stack.length >= 2) stack.length -= 2; };
    const addNewPairToStack = (stack, value, count) => stack.push(value, count);

    // The binary search loop continues as long as there is a range to explore.
    while (possibleUpperLimit - impossibleLowerLimit > 1) {
        // Calculate the midpoint `m` for the current search range.
        // `Math.floor` ensures integer division.
        const currentOperationLimit = Math.floor((possibleUpperLimit + impossibleLowerLimit) / 2);
        let isCurrentLimitViable = true; // Flag to track if `currentOperationLimit` works for the sequence.

        const operationStack = [];

        // Initialize the `operationStack` based on the first element of the sequence.
        const firstSequenceElement = numericSequence[0];
        if (firstSequenceElement > 1) {
            addNewPairToStack(operationStack, 1, 1);
            addNewPairToStack(operationStack, firstSequenceElement, 1);
        } else {
            addNewPairToStack(operationStack, 1, 1);
        }

        // Iterate through the rest of the sequence, starting from the second element.
        for (let seqIndex = 1; seqIndex < sequenceItemCount; ++seqIndex) {
            // If `currentOperationLimit` has already been found infeasible, stop processing.
            if (!isCurrentLimitViable) {
                break;
            }

            const currentElementValue = numericSequence[seqIndex];
            const topStackValue = retrieveStackTopValue(operationStack);

            // Scenario 1: Current element is greater than the top value on the stack.
            // This often means we can add the current element directly, after some stack cleanup.
            if (topStackValue !== null && topStackValue < currentElementValue) {
                // Remove any trailing pairs from the stack that have a count of 1.
                // This simplifies the stack before adding a new larger element.
                while (operationStack.length > 2 && retrieveStackTopCount(operationStack) === 1) {
                    removeLastPairFromStack(operationStack);
                }
                addNewPairToStack(operationStack, currentElementValue, 1);
            }
            // Scenario 2: Current element is less than or equal to the top value on the stack.
            // This requires more complex merging or modification of the stack.
            else {
                // If `currentOperationLimit` is 1, and we're in this scenario, it means
                // no merging/incrementing is possible, making it unviable.
                if (currentOperationLimit === 1) {
                    isCurrentLimitViable = false;
                    break;
                }

                // Pop elements from the stack that are strictly greater than the current element.
                while (retrieveStackTopValue(operationStack) !== null && retrieveStackTopValue(operationStack) > currentElementValue) {
                    removeLastPairFromStack(operationStack);
                }

                const updatedTopStackValue = retrieveStackTopValue(operationStack);

                // After popping, if the new stack top value is less than the current element,
                // add the current element with a count of 2.
                if (updatedTopStackValue !== null && updatedTopStackValue < currentElementValue) {
                    addNewPairToStack(operationStack, currentElementValue, 2);
                }
                // If the new stack top value is equal to the current element,
                // we need to attempt to merge or increment counts.
                else if (updatedTopStackValue === currentElementValue) {
                    // `requiredMergeDepth` tracks a conceptual merging depth.
                    // It starts with the current element's value and decreases as pairs are removed.
                    let requiredMergeDepth = currentElementValue;

                    // Iterate backward through the stack, examining pairs.
                    // `pairCountIndex` points to the count element of a pair.
                    let pairCountIndex = operationStack.length - 1;
                    for (; pairCountIndex >= 1; pairCountIndex -= 2) {
                        const currentPairValue = operationStack[pairCountIndex - 1];
                        const currentPairCount = operationStack[pairCountIndex];

                        // If a previous pair's value is less than `requiredMergeDepth`,
                        // we can satisfy the condition by adding the current element with a count of 2.
                        if (currentPairValue < requiredMergeDepth) {
                            addNewPairToStack(operationStack, currentElementValue, 2);
                            break; // Successfully handled, exit inner loop.
                        }

                        // If the current pair's count is less than the `currentOperationLimit`,
                        // we can increment its count.
                        if (currentPairCount < currentOperationLimit) {
                            operationStack[pairCountIndex]++; // Increment the count for this pair.
                            // If the value of this modified pair is still less than the current element,
                            // then add the current element with a count of 1.
                            if (currentPairValue < currentElementValue) {
                                addNewPairToStack(operationStack, currentElementValue, 1);
                            }
                            break; // Successfully handled, exit inner loop.
                        }

                        // If neither of the above conditions allowed handling the current element,
                        // remove the current pair from the stack and decrement `requiredMergeDepth`.
                        removeLastPairFromStack(operationStack);
                        requiredMergeDepth--;
                    }

                    // If the inner loop completed without breaking (i.e., `pairCountIndex` became less than 1),
                    // it means we could not successfully process the current element with `currentOperationLimit`.
                    if (pairCountIndex < 1) {
                        isCurrentLimitViable = false;
                    }
                }
            }
        } // End of sequence iteration.

        // Based on whether `currentOperationLimit` was viable, adjust binary search bounds.
        if (isCurrentLimitViable) {
            possibleUpperLimit = currentOperationLimit;
        } else {
            impossibleLowerLimit = currentOperationLimit;
        }
    } // End of binary search loop.

    // After the binary search, `possibleUpperLimit` holds the smallest 'm' that is feasible.
    return possibleUpperLimit;
}