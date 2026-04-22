// This module is designed to process a numerical sequence provided as input,
// applying a complex, state-driven algorithm to a dynamically growing and shrinking list.
// The primary goal is to determine the maximum value achieved within this evolving list.

/**
 * A utility function to verify the structural integrity of the parsed input lines.
 * It checks for the correct number of lines, valid numeric length, and consistency.
 * @param {string[]} parsedLines - An array where each element is a line from the original input string.
 * @param {number} expectedElementCount - The count of elements expected in the main sequence.
 * @returns {boolean} Returns `true` if the input structure meets basic validity criteria, `false` otherwise.
 */
function checkInputValidity(parsedLines, expectedElementCount) {
    // Ensure there are at least two lines: one for length, one for the sequence.
    if (!parsedLines || parsedLines.length < 2) {
        console.error("Input processing error: Not enough lines provided in the input data.");
        return false;
    }
    // Attempt to parse the expected length from the first line.
    const declaredLength = parseInt(parsedLines[0], 10);
    // Validate if the declared length is a positive integer.
    if (isNaN(declaredLength) || declaredLength < 1) {
        console.error("Input processing error: The first line must contain a valid positive integer for sequence length.");
        return false;
    }
    // Confirm that the declared length matches the actual number of parsed elements.
    if (declaredLength !== expectedElementCount) {
        console.error(`Input processing error: Declared length (${declaredLength}) does not match actual element count (${expectedElementCount}).`);
        return false;
    }
    return true; // All checks passed.
}

/**
 * Determines if all numeric values within a given array are identical.
 * This helper is used to evaluate a specific state transition condition.
 * @param {number[]} numericArray - The array whose elements are to be compared.
 * @returns {boolean} Returns `true` if every element in the array is the same as the first element, `false` otherwise.
 */
function areAllValuesUniform(numericArray) {
    // An empty array is considered uniform for this context.
    if (numericArray.length === 0) return true;
    const referenceValue = numericArray[0];
    // Use the `every` method for efficient comparison.
    return numericArray.every(element => element === referenceValue);
}

/**
 * The core function that processes the input and calculates the final result.
 * It simulates a complex sequence manipulation based on specific rules and states.
 * @param {string} rawInputContent - The complete input string, typically from stdin or a textarea.
 */
function calculateSequenceMax(rawInputContent) {
    // Pre-process the raw input: remove leading/trailing whitespace and split into lines.
    const dataLines = rawInputContent.trim().split('\n');

    // Extract the total count of numbers expected in the primary sequence.
    const totalElementCount = parseInt(dataLines[0], 10);
    // Parse the second line into an array of numbers, converting string parts to integers.
    const primarySequence = dataLines[1].split(' ').map(Number);

    // Execute input validation. If it fails, log an error and terminate execution.
    if (!checkInputValidity(dataLines, primarySequence.length)) {
        console.error("Critical input validation failed. Cannot proceed with computation.");
        return;
    }

    // Initialize the primary mutable list, `workingValues`.
    // Its initial size is set by the first element of `primarySequence`, filled with ones.
    let workingValues = Array(primarySequence[0]).fill(1);

    // `processingStatus` acts as a state machine variable (0, 1, or 2).
    // `currentThreshold` is a counter used in specific state transitions.
    let processingStatus = 0;
    let currentThreshold = 1;

    // `peakValueFound` will store the highest number observed in `workingValues` at any point.
    let peakValueFound = 0;

    // The main processing loop iterates through `primarySequence` from the second element.
    for (let mainLoopIndex = 1; mainLoopIndex < totalElementCount; mainLoopIndex++) {
        const currentPrimaryValue = primarySequence[mainLoopIndex];
        const previousPrimaryValue = primarySequence[mainLoopIndex - 1];

        // State-dependent pre-processing: If `processingStatus` is 2, re-evaluate list uniformity.
        if (processingStatus === 2) {
            // Check if all elements in `workingValues` are currently the same.
            if (!areAllValuesUniform(workingValues)) {
                processingStatus = 1; // If not uniform, transition to state 1.
            } else {
                processingStatus = 0; // If uniform, revert to state 0.
            }
        }

        // Conditional logic based on comparison of current and previous primary values.
        if (currentPrimaryValue > previousPrimaryValue) {
            const differenceMagnitude = currentPrimaryValue - previousPrimaryValue;
            // If the current value is larger, extend `workingValues` with `1`s.
            for (let subLoopIndex = 0; subLoopIndex < differenceMagnitude; subLoopIndex++) {
                workingValues.push(1);
                // If the state is not 0, ensure it transitions to 1, indicating a change.
                if (processingStatus !== 0) {
                    processingStatus = 1;
                }
            }
        }
        // Alternative path: If current value is not greater and `processingStatus` is 0.
        else if (processingStatus === 0) {
            const targetIndexForIncrement = currentPrimaryValue - 1;
            // Safely increment the value at the calculated index, if it exists.
            if (targetIndexForIncrement >= 0 && targetIndexForIncrement < workingValues.length) {
                workingValues[targetIndexForIncrement]++;
            } else {
                // This scenario could indicate an array out-of-bounds access if not handled.
                // The original logic implies valid indexing, so we proceed assuming it.
                // For robust code, error handling or state adjustment might be needed here.
            }

            // Truncate `workingValues` to the length specified by `currentPrimaryValue`.
            workingValues.length = currentPrimaryValue;

            // If the list is not reduced to a single element, transition to state 1 and update threshold.
            if (workingValues.length !== 1) {
                processingStatus = 1;
                currentThreshold++;
            }
        }
        // Another alternative path: If current value is not greater and `processingStatus` is 1.
        else if (processingStatus === 1) {
            // Truncate `workingValues` to the current primary value's length.
            workingValues.length = currentPrimaryValue;

            // Iterate backwards through the modified `workingValues` list.
            for (let subLoopIndex = workingValues.length - 1; subLoopIndex >= 0; subLoopIndex--) {
                // If an element matches `currentThreshold`, reset it to 1.
                if (workingValues[subLoopIndex] === currentThreshold) {
                    workingValues[subLoopIndex] = 1;
                }
                // If an element does not match, increment it, transition to state 2, and exit this inner loop.
                else {
                    workingValues[subLoopIndex]++;
                    processingStatus = 2;
                    break; // Critical: exit immediately after the first non-matching element is processed.
                }
            }
        }
    }

    // After the main loop completes, determine the overall maximum value within `workingValues`.
    // Using the spread operator with Math.max provides a concise way to find the maximum.
    peakValueFound = Math.max(...workingValues);

    // Output the final calculated maximum value to the console.
    console.log(peakValueFound);
}

// --- Environment-Specific Execution Logic ---

/**
 * A debugging utility function intended for use in a browser environment.
 * It retrieves input from a designated HTML element and initiates the calculation.
 */
function runDebugModeSimulation() {
    // Assumes an HTML input element with the ID 'inputDataField' exists.
    const debugInputContent = document.getElementById("inputDataField").value;
    calculateSequenceMax(debugInputContent);
}

// This conditional block determines how the script receives input based on its execution environment.
// It checks if the script is being run directly via Node.js (e.g., in a competitive programming setup).
if (typeof require === 'function' && require.main === module) {
    // In a Node.js environment, read the entire content of standard input synchronously.
    const fileSystemModule = require("fs");
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    calculateSequenceMax(standardInputContent);
}
// If not in a Node.js environment (e.g., a browser), the `runDebugModeSimulation` function
// would typically be invoked by a user action (like a button click) rather than automatically.