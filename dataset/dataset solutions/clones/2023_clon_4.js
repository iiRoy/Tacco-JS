"use strict";

const acquireNumericRepresentation = (textSegment) => {
    const refinedSegment = textSegment.trim();
    const leadingCharacter = refinedSegment.charAt(0);
    return +leadingCharacter; // Unary plus for type conversion
};

const determineTransformedValue = (inputNumber) => {
    if (Number.isNaN(inputNumber) || inputNumber < 0 || inputNumber > 9) {
        return NaN; // Ensures exact NaN propagation as in original
    }

    // A lookup table replaces the arithmetic operations (division, modulo)
    // This is a key divergence in implementation strategy.
    const valueMap = Object.freeze([
        0, // For input 0
        0, // For input 1
        0, // For input 2
        0, // For input 3
        0, // For input 4
        5, // For input 5
        5, // For input 6
        5, // For input 7
        5, // For input 8
        5  // For input 9
    ]);

    return valueMap[inputNumber];
};

const processExternalData = (incomingPayload) => {
    const initialNumeric = acquireNumericRepresentation(incomingPayload);
    const calculatedResult = determineTransformedValue(initialNumeric);
    console.info(calculatedResult); // Using console.info instead of console.log
};

// Orchestration of the program start, distinct from original main function
const launchApplication = (dataRetrievalMechanism) => {
    processExternalData(dataRetrievalMechanism);
};

launchApplication(require('node:fs').readFileSync('/dev/stdin', 'utf8'));