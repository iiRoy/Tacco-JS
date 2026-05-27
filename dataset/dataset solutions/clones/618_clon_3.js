const fileSystem = require('fs');
const INPUT_FILE_SOURCE = '/dev/stdin';

const readAndProcessInput = (filePath) => {
    const rawContent = fileSystem.readFileSync(filePath, 'utf8');
    return rawContent.trim().split('\n');
};

const parseNumericValue = (str) => Number(str);

const roundToNearestInteger = (num) => Math.round(num);

const inputLines = readAndProcessInput(INPUT_FILE_SOURCE);

let accumulatorValue = parseNumericValue(inputLines[0]);

for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex += 2) {
    const operationToken = inputLines[lineIndex];

    if (operationToken === "=") {
        break;
    }

    const operandString = inputLines[lineIndex + 1];
    const currentOperand = parseNumericValue(operandString);

    switch (operationToken) {
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

    accumulatorValue = roundToNearestInteger(accumulatorValue);
}

console.log(accumulatorValue);
