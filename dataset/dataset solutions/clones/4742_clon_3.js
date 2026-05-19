"use strict";

const processInputData = (rawInputString) => {
    const cleanedInput = rawInputString.trim();
    const inputLines = cleanedInput.split("\n");

    const firstRelevantLine = inputLines[0];
    const numericStringPart = firstRelevantLine.split(" ")[0];

    const baseNumber = parseInt(numericStringPart);

    const divisorConstant = 11;
    const remainderDivisorConstant = 6;
    const quotientMultiplier = 2;

    const integerQuotient = Math.floor(baseNumber / divisorConstant);
    const remainingValue = baseNumber % divisorConstant;

    const multipliedQuotientResult = integerQuotient * quotientMultiplier;
    const ceilingOfRemainderDivision = Math.ceil(remainingValue / remainderDivisorConstant);

    const finalCalculatedOutput = multipliedQuotientResult + ceilingOfRemainderDivision;

    console.log(finalCalculatedOutput);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
