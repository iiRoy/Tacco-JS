// A specialized recursive function to evaluate conditions based on an XOR sequence.
// This function utilizes dynamic programming (memoization) to optimize performance
// by storing results of previously computed subproblems.
//
// @param {number} remainingCount - The number of remaining elements to process from the operand set.
// @param {number} currentXorState - The current XOR sum that we are attempting to achieve.
// @param {number[]} operandValues - An array of numerical values used in XOR operations.
// @param {string} operatorSequence - A string of characters ('0' or '1') defining the logical operation for each step.
//                                   '1' for AND (both paths must succeed), '0' for OR (at least one path must succeed).
// @param {Object.<number, Object.<number, boolean>>} cacheStore - A memoization table (nested object) to store results.
// @returns {boolean} - True if the condition is met for the current state and remaining elements, false otherwise.
function checkXORCombination(remainingCount, currentXorState, operandValues, operatorSequence, cacheStore) {
    // Defensive check: A negative remaining count indicates an invalid state,
    // which should ideally not be reached with proper initial parameters.
    if (remainingCount < 0) {
        return false;
    }

    // Base condition: If there are no more elements left to process,
    // the target XOR sum must be zero for the path to be valid.
    if (remainingCount === 0) {
        return (currentXorState === 0);
    }

    // Check the memoization cache: If this specific subproblem (defined by remainingCount and currentXorState)
    // has already been computed, return its stored result to avoid redundant calculations.
    if (cacheStore[remainingCount] && cacheStore[remainingCount][currentXorState] !== undefined) {
        return cacheStore[remainingCount][currentXorState];
    }

    // Determine the index for the current operand value and operator character.
    // The problem implies processing elements from the end of the input sequence.
    const currentElementIndex = operatorSequence.length - remainingCount;
    const currentOperationCharacter = operatorSequence[currentElementIndex];
    const currentOperandValue = operandValues[currentElementIndex];

    let computedOutcome; // Variable to hold the boolean result of the current step.

    // Recursively evaluate the two possible branches for the current element:
    // 1. One path considers the state without XORing the current operand value.
    // 2. The other path considers the state after XORing the current operand value.
    const outcomeWithoutCurrentXOR = checkXORCombination(
        remainingCount - 1,
        currentXorState,
        operandValues,
        operatorSequence,
        cacheStore
    );
    const outcomeWithCurrentXOR = checkXORCombination(
        remainingCount - 1,
        currentXorState ^ currentOperandValue,
        operandValues,
        operatorSequence,
        cacheStore
    );

    // Apply the logical operation specified by 'currentOperationCharacter'.
    // '1' implies an AND-like condition: both recursive outcomes must be true.
    // '0' implies an OR-like condition: at least one recursive outcome must be true.
    if (currentOperationCharacter === '1') {
        computedOutcome = outcomeWithoutCurrentXOR && outcomeWithCurrentXOR;
    } else if (currentOperationCharacter === '0') {
        computedOutcome = outcomeWithoutCurrentXOR || outcomeWithCurrentXOR;
    } else {
        // Enhanced error handling for unexpected operator characters.
        // In this problem context, it's assumed only '0' or '1' will occur,
        // but this adds robustness.
        console.error("Error: Invalid operator character encountered in sequence:", currentOperationCharacter);
        return false; // Treat as an invalid path if operator is unknown.
    }

    // Store the computed result in the memoization cache before returning.
    // Ensure the inner object for 'remainingCount' exists before assigning.
    cacheStore[remainingCount] = cacheStore[remainingCount] || {};
    cacheStore[remainingCount][currentXorState] = computedOutcome;

    return computedOutcome;
}

// Main entry point for processing the input data and solving the problem for multiple test cases.
// Reads input from stdin, parses it into test cases, and invokes the solver function for each.
//
// @param {string} rawInputData - The entire input content as a single string, typically read from /dev/stdin.
function processInputScenarios(rawInputData) {
    // Split the raw input string into an array of individual lines.
    const dataLines = rawInputData.split('\n');

    // Parse the total number of test cases from the first line.
    const totalTestCases = Number(dataLines[0]);

    // Input validation: Ensure the number of test cases is a valid positive integer.
    if (isNaN(totalTestCases) || totalTestCases <= 0) {
        console.error("Input Error: Invalid or non-positive number of test cases specified.");
        return; // Exit if the primary input is malformed.
    }

    // A buffer to collect the results of all test cases before printing them.
    const collectedResults = [];

    // Iterate through the input lines, processing data for each test case.
    // Each test case requires 3 lines of input: N, A (space-separated values), and S (operator sequence).
    for (let linePointer = 0; linePointer < totalTestCases * 3; linePointer += 3) {
        // Extract raw string data for the current test case.
        const numElementsString = dataLines[linePointer + 1];
        const stringValuesArray = dataLines[linePointer + 2].split(' ');
        const operatorSequenceString = dataLines[linePointer + 3];

        // Parse the number of elements for the current test case.
        const actualNumElements = parseInt(numElementsString, 10);

        // Extensive input validation for the current test case.
        // Checks if N is a valid number, non-negative, and consistent with array/string lengths.
        if (isNaN(actualNumElements) || actualNumElements < 0 ||
            actualNumElements !== stringValuesArray.length ||
            actualNumElements !== operatorSequenceString.length) {
            console.error(`Data Error: Skipping malformed test case at line offset ${linePointer}. ` +
                          `Expected ${actualNumElements} elements, but got A_len=${stringValuesArray.length}, S_len=${operatorSequenceString.length}.`);
            collectedResults.push('Error'); // Mark this specific case as an error.
            continue; // Move to the next test case.
        }

        // Pre-process the array of string values into an array of numbers.
        // This improves efficiency by avoiding repeated string-to-number conversions
        // within the recursive `checkXORCombination` function.
        const numericOperandValues = stringValuesArray.map(val => parseInt(val, 10));

        // Validation for the parsed numeric operand values.
        if (numericOperandValues.some(isNaN)) {
             console.error(`Data Error: Skipping malformed test case at line offset ${linePointer}. ` +
                           `Contains invalid non-numeric values in operand array.`);
             collectedResults.push('Error');
             continue;
        }

        // Initialize a fresh memoization cache for each individual test case.
        // This ensures results from one test case do not interfere with others.
        const dynamicProgrammingCache = {};

        // Invoke the primary solver function with the initial parameters.
        // We start with 'actualNumElements' elements remaining and a 'currentXorState' of 0.
        const conditionSatisfied = checkXORCombination(
            actualNumElements,
            0, // Initial XOR sum is 0.
            numericOperandValues,
            operatorSequenceString,
            dynamicProgrammingCache
        );

        // Append the result to the buffer. The problem specifies '0' for true, '1' for false.
        collectedResults.push(conditionSatisfied ? '0' : '1');
    }

    // Output all collected results, each on a new line, to standard output.
    console.log(collectedResults.join('\n'));
}

// Execute the main processing function by reading input from standard input.
// This is typical for competitive programming environments.
processInputScenarios(require("fs").readFileSync("/dev/stdin", "utf8"));