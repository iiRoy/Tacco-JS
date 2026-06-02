"use strict";

const parseInputInteger = (inputString) => {
    return parseInt(inputString, 10);
};

const executeLogic = (fullInputContent) => {
    const firstInputLine = fullInputContent.split("\n")[0];
    const lineSegments = firstInputLine.split(" ");

    const valueA = parseInputInteger(lineSegments[0]);
    const valueB = parseInputInteger(lineSegments[1]);
    const valueC = parseInputInteger(lineSegments[2]);

    const calculatedQuotientFloor = Math.floor(valueB / valueA);

    let finalOutputValue;
    if (calculatedQuotientFloor >= valueC) {
        finalOutputValue = valueC;
    } else {
        finalOutputValue = calculatedQuotientFloor;
    }

    console.log(finalOutputValue);
};

const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
executeLogic(standardInputContent);
