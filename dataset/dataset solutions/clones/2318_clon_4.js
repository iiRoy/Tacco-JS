"use strict";
const processInput = (rawTextData) => {
    const parsedNumbers = rawTextData.split('\n').map(lineContent => parseInt(lineContent.trim(), 10));
    const sumOfInputs = parsedNumbers[0] + parsedNumbers[1];
    const complementValue = 6 - sumOfInputs;
    console.log(complementValue);
};
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));