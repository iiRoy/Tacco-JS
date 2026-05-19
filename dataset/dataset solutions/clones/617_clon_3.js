var fileSystem = require('fs');
var rawInputString = fileSystem.readFileSync('/dev/stdin', 'utf8');

var inputLines = rawInputString.trim().split("\n");

var accumulatorValue = parseInt(inputLines[0]);

let lineIndex = 1;
while (lineIndex < inputLines.length) {
    const currentOperator = inputLines[lineIndex];

    if (currentOperator === "=") {
        break;
    }

    const operandString = inputLines[lineIndex + 1];
    const operandValue = parseInt(operandString);

    switch (currentOperator) {
        case "+":
            accumulatorValue += operandValue;
            break;
        case "-":
            accumulatorValue -= operandValue;
            break;
        case "*":
            accumulatorValue *= operandValue;
            break;
        case "/":
            accumulatorValue /= operandValue;
            break;
    }

    accumulatorValue = parseInt(accumulatorValue);

    lineIndex += 2;
}

console.log(accumulatorValue);
