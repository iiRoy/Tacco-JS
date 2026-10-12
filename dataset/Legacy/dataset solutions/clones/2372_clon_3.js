"use strict";

const HUNDRED_BASE_VALUE = 100;

// Helper function to determine the minimum number of operations
// to reduce a value to zero using greedy decrements of 5, 4, 3, 2, or 1.
const calculateMinimumGreedyDecrements = (initialValue) => {
    let operationCounter = 0;
    let currentValue = initialValue;

    // First, apply as many decrements of 5 as possible
    operationCounter += Math.floor(currentValue / 5);
    currentValue %= 5; // The remainder will be 0, 1, 2, 3, or 4

    // For any remaining value (1-4), it requires exactly one more operation
    // (e.g., 4 by 4, 3 by 3, 2 by 2, 1 by 1).
    if (currentValue > 0) {
        operationCounter += 1;
    }

    return operationCounter;
};

const processInputData = (rawInputString) => {
    // Standard input processing: trim whitespace and get the first line.
    const inputLines = rawInputString.trim().split("\n");
    const numberAsString = inputLines[0];

    // Convert the input string to an integer for numerical comparisons.
    const numericValue = parseInt(numberAsString, 10);

    // Guard clause: If the number is less than 100, it's an invalid case for the logic.
    if (numericValue < HUNDRED_BASE_VALUE) {
        console.log(0);
        return;
    }

    // Extract the last two digits from the string representation of the number.
    // This is equivalent to getting the tens and units place.
    const lastTwoDigitsString = numberAsString.slice(-2);
    const extractedLastTwoDigits = parseInt(lastTwoDigitsString, 10);

    // Special case: If the last two digits are 0, it means the number is already
    // a multiple of 100. In this problem's context, this implies a successful outcome.
    if (extractedLastTwoDigits === 0) {
        console.log(1);
        return;
    }

    // Calculate the required number of operations based on the extracted last two digits.
    // This uses the helper function to abstract the greedy decrement logic.
    const requiredHundredsOperations = calculateMinimumGreedyDecrements(extractedLastTwoDigits);

    // Construct a hypothetical value by adding multiples of 100 to the original
    // last two digits, using the calculated number of operations.
    // This represents the smallest number that ends with `extractedLastTwoDigits`
    // and requires `requiredHundredsOperations` of 100-unit additions.
    const constructedTargetValue = (HUNDRED_BASE_VALUE * requiredHundredsOperations) + extractedLastTwoDigits;

    // Final comparison: Check if the constructed target value is less than or equal to
    // the original input number. If it is, then the condition is met.
    if (constructedTargetValue <= numericValue) {
        console.log(1);
    } else {
        console.log(0);
    }
};

// Execute the main processing function with input read from stdin.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
