"use strict";

const extractAndAggregate = (currentNumberValue, currentPowerOfTen, remainingCycles, cumulativeSum) => {
    if (remainingCycles === 0) {
        return cumulativeSum;
    }

    const currentDigit = Math.floor(currentNumberValue / currentPowerOfTen);
    const nextNumberValue = currentNumberValue % currentPowerOfTen;
    const nextPowerOfTen = currentPowerOfTen / 10;

    return extractAndAggregate(nextNumberValue, nextPowerOfTen, remainingCycles - 1, cumulativeSum + currentDigit);
};

const processNumericalInput = (sourceStringContent) => {
    const stringCharacterCount = sourceStringContent.length;
    const numericalInterpretation = Number.parseInt(sourceStringContent.trim(), 10);

    if (Number.isNaN(numericalInterpretation)) {
        console.log(Number.NaN);
        return;
    }

    const initialMagnitude = Math.pow(10, stringCharacterCount - 1);
    
    const calculatedTotal = extractAndAggregate(numericalInterpretation, initialMagnitude, stringCharacterCount, 0);

    const ultimateOutcome = (calculatedTotal === 1) ? 10 : calculatedTotal;

    console.log(ultimateOutcome);
};

const initiateOperation = (rawDataFromSource) => {
    processNumericalInput(rawDataFromSource);
};

initiateOperation(require('fs').readFileSync('/dev/stdin', 'utf8'));