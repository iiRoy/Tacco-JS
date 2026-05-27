const FILE_PATH = '/dev/stdin';
const fileSystem = require('fs');
let rawInputData = fileSystem.readFileSync(FILE_PATH, 'utf8');

function roundAndConvertToString(numericValue) {
    return numericValue.toFixed(0);
}

let processedLines = rawInputData.trim().split("\n");

let accumulatorValue = Number(processedLines[0]);

const OPERATION_STEP_SIZE = 2;

for (let operationIndex = 1; operationIndex < processedLines.length - 1; operationIndex += OPERATION_STEP_SIZE) {
    let currentOperator = processedLines[operationIndex];
    let currentOperand = Number(processedLines[operationIndex + 1]);

    switch (currentOperator) {
        case "+":
            accumulatorValue += currentOperand;
            break;
        case "-":
            accumulatorValue -= currentOperand;
            break;
        case "*":
            accumulatorValue *= currentOperand;
            break;
        case "/":
            accumulatorValue /= currentOperand;
            break;
    }

    accumulatorValue = roundAndConvertToString(accumulatorValue);
}

console.log(accumulatorValue);
