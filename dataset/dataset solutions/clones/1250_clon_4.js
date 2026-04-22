process.stdin.resume();
process.stdin.setEncoding('utf8');

const mathematicalOperations = {
    '+': (operandA, operandB) => operandA + operandB,
    '-': (operandA, operandB) => operandA - operandB,
    '*': (operandA, operandB) => operandA * operandB,
    '/': (operandA, operandB) => Math.floor(operandA / operandB)
};

const processInputLine = (rawLineContent) => {
    const expressionComponents = rawLineContent.trim().match(/^(\d+)\s+(\d+)\s+([+\-*/])$/);

    if (!expressionComponents) {
        return;
    }

    const firstNumericalValue = parseInt(expressionComponents[1], 10);
    const secondNumericalValue = parseInt(expressionComponents[2], 10);
    const operationSymbol = expressionComponents[3];

    const selectedOperation = mathematicalOperations[operationSymbol];

    if (selectedOperation) {
        console.log(selectedOperation(firstNumericalValue, secondNumericalValue));
    }
};

process.stdin.on('data', (receivedPayload) => {
    const dataLines = receivedPayload.toString().split('\n').filter(line => line.trim() !== '');
    dataLines.forEach(lineItem => processInputLine(lineItem));
});