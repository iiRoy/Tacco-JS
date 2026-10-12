'use strict';

const processInputAndCompute = (rawText) => {
    const numberExtractionPattern = /^(\d+).*?\n(\d+).*$/s;
    const capturedValues = rawText.match(numberExtractionPattern);

    let firstOperand, secondOperand;

    if (capturedValues && capturedValues.length >= 3) {
        firstOperand = Number(capturedValues[1]);
        secondOperand = Number(capturedValues[2]);
    } else {
        firstOperand = NaN;
        secondOperand = NaN;
    }

    return Math.pow(firstOperand, 2) - secondOperand;
};

const executeProgram = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalResult = processInputAndCompute(fileContent);
    console.log(finalResult);
};

executeProgram();
