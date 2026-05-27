"use strict";

const parseNumericValues = (inputStrings) => {
    const numericValues = [];
    for (let i = 0; i < inputStrings.length; i++) {
        numericValues.push(parseInt(inputStrings[i], 10));
    }
    return numericValues;
};

const processInput = (rawData) => {
    const inputLines = rawData.trim().split("\n");

    const parsedData = parseNumericValues(inputLines);

    const totalCount = parsedData[0];
    const valA = parsedData[1];
    const valB = parsedData[2];
    const valC = parsedData[3];
    const valD = parsedData[4];
    const valE = parsedData[5];

    const minimumRate = Math.min(valA, valB, valC, valD, valE);

    const divisionResult = totalCount / minimumRate;

    const sumWithOffset = divisionResult + 4;

    const finalCalculatedValue = Math.ceil(sumWithOffset);

    console.log(finalCalculatedValue);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
