const fileContent = require('fs').readFileSync('/dev/stdin', 'ascii');
let rawInputLines = fileContent.split("\n");

let endMarkerIndex = -1;
let currentLineIndex = rawInputLines.length - 1;

while (currentLineIndex >= 0) {
    if (rawInputLines[currentLineIndex].includes("?")) {
        endMarkerIndex = currentLineIndex;
        break;
    }
    currentLineIndex--;
}

const processedInputLines = rawInputLines.slice(0, endMarkerIndex);

const finalResults = processedInputLines.map(calculateResult);
console.log(finalResults.join("\n"));

function calculateResult(currentLine) {
    const expressionParts = currentLine.split(" ", 3);

    const operandA = parseInt(expressionParts[0], 10);
    const operator = expressionParts[1];
    const operandB = parseInt(expressionParts[2], 10);

    let resultValue;

    switch (operator) {
        case '+':
            resultValue = operandA + operandB;
            break;
        case '-':
            resultValue = operandA - operandB;
            break;
        case '*':
            resultValue = operandA * operandB;
            break;
        default: // This covers '/' and any other unexpected operator, matching original behavior.
            resultValue = Math.floor(operandA / operandB);
            break;
    }
    return resultValue;
}
