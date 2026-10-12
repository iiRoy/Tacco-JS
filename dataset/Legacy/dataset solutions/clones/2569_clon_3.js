"use strict";

const acquireRawInput = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const executeCalculation = (inputDataString) => {
    const processedString = inputDataString.trim();
    const lineSegments = processedString.split("\n");

    const numericValue = parseInt(lineSegments[0], 10);
    
    const finalResult = Math.pow(numericValue, 3);

    console.log(finalResult);
};

const initialInput = acquireRawInput();
executeCalculation(initialInput);
