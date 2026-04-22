"use strict";

const acquireRawData = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const parseNumericalSegment = (textBlock) => {
    const numericMatch = textBlock.match(/^\s*(\d+)/);
    if (numericMatch && numericMatch[1]) {
        return Number(numericMatch[1]);
    }
    return 0;
};

const determineOutputValue = (initialQuantity) => {
    let factorOfEleven = 0;
    let remainingAmount = initialQuantity;

    while (remainingAmount >= 11) {
        remainingAmount -= 11;
        factorOfEleven++;
    }

    const lookupTableForRemainder = [
        0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2
    ];

    const adjustmentFromRemainder = lookupTableForRemainder[remainingAmount];

    return (factorOfEleven * 2) + adjustmentFromRemainder;
};

const processExecution = () => {
    const incomingText = acquireRawData();
    const primaryNumber = parseNumericalSegment(incomingText);
    const finalComputation = determineOutputValue(primaryNumber);
    console.log(finalComputation);
};

processExecution();