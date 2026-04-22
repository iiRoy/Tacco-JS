"use strict";

// This module provides file system capabilities for reading input.
var fileSystemModule = require("fs");

// Defines the standard input stream path, typical for automated environments.
var inputSourceIdentifier = "/dev/stdin";

// Reads the entire content from the specified input source as a UTF-8 encoded string.
var comprehensiveInputData = fileSystemModule.readFileSync(inputSourceIdentifier, "utf8");

// Processes the raw input data: splits it into individual tokens using any whitespace as a delimiter,
// and then filters out any empty strings that might result from multiple consecutive delimiters.
var processedInputTokens = comprehensiveInputData.split(/\s+/).filter(Boolean);

// Maintains an internal pointer to track the current position within the 'processedInputTokens' array,
// indicating which token is next to be consumed.
var currentTokenPointer = 0;

/**
 * Retrieves the subsequent token from the global input stream.
 * It offers an option to return the token as a string or to convert it into a numerical type.
 *
 * @param {boolean} [returnAsString=false] - If true, the token is returned as a string.
 *                                          If false (or omitted), it attempts to convert the token to a number.
 * @returns {string|number} The next available input token, in the specified format.
 */
function obtainNextInputUnit(returnAsString) {
    var unitValue = processedInputTokens[currentTokenPointer];
    currentTokenPointer = currentTokenPointer + 1; // Advance the pointer.

    if (returnAsString === true) {
        return unitValue; // Return the token as a raw string.
    } else {
        return Number(unitValue); // Attempt to cast the token to a number.
    }
}

/**
 * A specialized utility function designed to read a predefined number of numeric values
 * consecutively from the input stream and assemble them into an array.
 * This function addresses the common pattern of reading an array of numbers
 * after its size has been specified, resolving a potential ambiguity in the original snippet.
 *
 * @param {number} numberOfElementsToRead - The precise count of numeric elements expected.
 * @returns {Array<number>} An array populated with the 'numberOfElementsToRead' numeric values.
 */
function gatherNumericSequence(numberOfElementsToRead) {
    var collectedSequence = [];
    var iterationCounter = 0;

    // Loop until the required number of elements has been read.
    while (iterationCounter < numberOfElementsToRead) {
        collectedSequence.push(obtainNextInputUnit(false)); // Each unit is read as a number.
        iterationCounter = iterationCounter + 1;
    }
    return collectedSequence;
}

/**
 * Calculates the non-negative difference between two arbitrary numerical values.
 * This avoids direct use of `Math.abs` for a slight implementation variation.
 *
 * @param {number} valueOne - The first numerical operand.
 * @param {number} valueTwo - The second numerical operand.
 * @returns {number} The absolute difference between `valueOne` and `valueTwo`.
 */
function computeAbsoluteDifference(valueOne, valueTwo) {
    if (valueOne > valueTwo) {
        return valueOne - valueTwo;
    } else {
        return valueTwo - valueOne;
    }
}

/**
 * Evaluates the relationship between two numerical operands and yields a specific integer code:
 * 0 if they are identical, 1 if their absolute difference is exactly one, and 2 otherwise.
 * This encapsulates the core comparison logic used in the iterative reduction step.
 *
 * @param {number} operandA - The first number for comparison.
 * @param {number} operandB - The second number for comparison.
 * @returns {number} An integer (0, 1, or 2) representing the comparison outcome.
 */
function evaluatePairwiseRelationship(operandA, operandB) {
    // Case 1: The two operands are exactly the same.
    if (operandA === operandB) {
        return 0;
    }

    // Case 2: If not equal, calculate their absolute difference.
    var currentDifference = computeAbsoluteDifference(operandA, operandB);

    // Check if the absolute difference is exactly one.
    if (currentDifference === 1) {
        return 1;
    }

    // Case 3: For all other scenarios (difference is greater than one).
    return 2;
}

// This is the main entry point for the sequence processing logic.
// It orchestrates reading the input, performing initial calculations,
// and then iteratively reducing the sequence based on specific rules.
function executeSequenceProcessing() {
    // First, read the total count of elements that will follow.
    var totalInitialElements = obtainNextInputUnit(false);

    // Implement a basic validation check for the input count.
    // This is an added robustness feature.
    if (totalInitialElements < 0) {
        // If the count is negative, it implies an invalid input context.
        // Returning 0 as a default for such an invalid scenario.
        return 0;
    }

    // Now, read the actual sequence of numbers using the determined count.
    var initialNumericalArray = gatherNumericSequence(totalInitialElements);

    // Edge case handling: If there's only one element in the input,
    // that element itself is the final result, no further processing needed.
    if (initialNumericalArray.length === 1) {
        return initialNumericalArray[0];
    }
    // Another edge case: if totalInitialElements was 0, initialNumericalArray will be empty.
    // The problem logic requires at least two elements for differences.
    if (initialNumericalArray.length === 0) {
        return 0; // Default for an empty sequence.
    }


    // Create an array to store the absolute differences between adjacent elements
    // from the initial numerical array. This new array will be one element shorter.
    var intermediateDifferenceArray = new Array(initialNumericalArray.length - 1);
    var firstLoopIndex = 0;

    // Populate the 'intermediateDifferenceArray' with calculated differences.
    while (firstLoopIndex < initialNumericalArray.length - 1) {
        intermediateDifferenceArray[firstLoopIndex] = computeAbsoluteDifference(
            initialNumericalArray[firstLoopIndex],
            initialNumericalArray[firstLoopIndex + 1]
        );
        firstLoopIndex = firstLoopIndex + 1;
    }

    // Begin the iterative reduction process. This loop continues as long as
    // the 'intermediateDifferenceArray' contains more than a single element.
    while (intermediateDifferenceArray.length !== 1) {

        var currentArraySize = intermediateDifferenceArray.length;
        // Determine the size of the array for the next iteration.
        // Integer division (Math.floor) is essential here.
        var nextIterationArraySize = Math.floor(currentArraySize / 2);

        // Allocate a new array to store the results of the current reduction step.
        var nextIterationSequenceData = new Array(nextIterationArraySize);
        var reductionStepIndex = 0;

        // Process elements by pairing them from opposing ends of the current array.
        while (reductionStepIndex < nextIterationArraySize) {
            var leftElementForComparison = intermediateDifferenceArray[reductionStepIndex];
            var rightElementForComparison = intermediateDifferenceArray[currentArraySize - 1 - reductionStepIndex];

            // Apply the specific comparison rules to derive the new element.
            nextIterationSequenceData[reductionStepIndex] = evaluatePairwiseRelationship(
                leftElementForComparison,
                rightElementForComparison
            );
            reductionStepIndex = reductionStepIndex + 1;
        }

        // Replace the current working array with the newly computed array for the subsequent iteration.
        intermediateDifferenceArray = nextIterationSequenceData;
    }

    // Once the loop terminates, the 'intermediateDifferenceArray' will contain
    // exactly one element, which represents the final outcome of the entire process.
    return intermediateDifferenceArray[0];
}

// Invoke the primary processing function and store its computed result.
var computedFinalResult = executeSequenceProcessing();

// Output the final result to the standard output stream.
// The result is converted to a string and followed by a newline character.
// An explicit check for 'undefined' is included for robustness, though
// 'executeSequenceProcessing' is designed to always return a number.
if (computedFinalResult !== undefined) {
    process.stdout.write(String(computedFinalResult) + '\n');
}