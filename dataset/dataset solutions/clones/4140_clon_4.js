"use strict";

// A utility to handle large number operations, replacing the custom bigInt library.
// This implementation utilizes the native JavaScript BigInt primitive, which represents
// a fundamentally different and built-in approach to handling arbitrary-precision integers
// compared to the original code's custom array-based class.
const createNumericQuantity = (inputRepresentation) => {
    if (typeof inputRepresentation === 'string') {
        return BigInt(inputRepresentation);
    }
    if (typeof inputRepresentation === 'number') {
        return BigInt(inputRepresentation);
    }
    return inputRepresentation; // Assume it's already a BigInt
};

const doubleNumericQuantity = (valueOperand) => {
    return valueOperand * 2n;
};

const checkMagnitudeOrder = (firstOperand, secondOperand) => {
    if (firstOperand < secondOperand) return -1;
    if (firstOperand > secondOperand) return 1;
    return 0;
};

// This is the core processing logic, serving as a Type IV clone of the original 'main' function.
// It takes the raw input string, processes it according to the problem's requirements,
// and outputs the calculated result.
const processInputMagnitudeGrowth = (incomingDataPayload) => {
    const dataLines = incomingDataPayload.trim().split("\n");
    const numericTokens = dataLines[0].split(" ");

    const initialAmountText = numericTokens[0];
    const targetBoundaryText = numericTokens[1];

    const initialAmount = createNumericQuantity(initialAmountText);
    const targetBoundary = createNumericQuantity(targetBoundaryText);

    // The original code included a specific hardcoded check for a particular value of Y
    // (576460752303423488, which is 2^59). This was indicated as an "emergency measure"
    // due to potential issues with their custom `bigInt` library for that specific case.
    // By employing the robust native `BigInt` primitive, this specific workaround becomes
    // obsolete, as the native implementation correctly handles all large number arithmetic.
    // Therefore, this clone omits the hardcoded check, relying on the generalized and
    // accurate BigInt arithmetic to achieve equivalent functionality for all inputs.

    // A recursive function is used here to determine the number of doublings,
    // providing a divergent approach from the original's imperative `while` loop.
    const calculateDoublingSteps = (currentMagnitude, limitMagnitude, stepCounter) => {
        // Base case: if the current magnitude has exceeded the limit, return the accumulated steps.
        if (checkMagnitudeOrder(currentMagnitude, limitMagnitude) > 0) { // currentMagnitude > limitMagnitude
            return stepCounter;
        }
        // Recursive step: double the current magnitude and increment the step counter.
        return calculateDoublingSteps(doubleNumericQuantity(currentMagnitude), limitMagnitude, stepCounter + 1n);
    };

    const finalStepCount = calculateDoublingSteps(initialAmount, targetBoundary, 0n);

    // Output the final count. The original code used `console.log`.
    // The `finalStepCount` is a BigInt, so it's converted to a string for standard output.
    console.log(finalStepCount.toString());
};

// This section replaces the original's input reading and function call structure.
// It retrieves the standard input and passes it to the new processing function.
// Using 'node:fs' for the module import path to further differentiate from 'fs'.
processInputMagnitudeGrowth(require('node:fs').readFileSync('/dev/stdin', 'utf8'));