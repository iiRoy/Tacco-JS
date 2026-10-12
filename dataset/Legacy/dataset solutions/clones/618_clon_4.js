const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputSegments = fileContent.trim().split('\n');

const operationDispatch = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
};

function processOperationsRecursively(currentAccumulator, segmentIndex) {
    if (segmentIndex >= inputSegments.length || inputSegments[segmentIndex] === '=') {
        return currentAccumulator;
    }

    const currentOperatorSymbol = inputSegments[segmentIndex];
    const nextOperandValue = Number(inputSegments[segmentIndex + 1]);

    const selectedOperation = operationDispatch[currentOperatorSymbol];
    let intermediateResult = selectedOperation(currentAccumulator, nextOperandValue);

    intermediateResult = Number(intermediateResult.toFixed(0));

    return processOperationsRecursively(intermediateResult, segmentIndex + 2);
}

const initialNumericValue = Number(inputSegments[0]);
const finalCalculatedValue = processOperationsRecursively(initialNumericValue, 1);

console.log(finalCalculatedValue);
