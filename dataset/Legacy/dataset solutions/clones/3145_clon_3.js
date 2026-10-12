"use strict";

const parseStringToNumber = (inputString) => Number(inputString);

const calculateFinalResult = (firstOperand, secondOperand) => {
    if (firstOperand === secondOperand) {
        return firstOperand;
    } else {
        const sumOfOperands = firstOperand + secondOperand;
        const isSumEven = (sumOfOperands % 2 === 0);
        if (isSumEven) {
            return (firstOperand ^ secondOperand) - 1;
        } else {
            return firstOperand ^ secondOperand;
        }
    }
};

function ProcessInput(rawInputData) {
    const newlineDelimiter = "\n";
    const whitespaceRegex = /\s+/;
    
    let allInputLines = rawInputData.split(newlineDelimiter);
    
    const firstLineContent = allInputLines.shift();
    const numberStrings = firstLineContent.split(whitespaceRegex);
    
    const valueOne = parseStringToNumber(numberStrings[0]);
    const valueTwo = parseStringToNumber(numberStrings[1]);

    const computedAnswer = calculateFinalResult(valueOne, valueTwo);
    
    console.log(computedAnswer);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const inputFromStdin = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
ProcessInput(inputFromStdin);
