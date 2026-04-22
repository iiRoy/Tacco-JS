const resourceAccessor = require('node:fs');

const streamContent = resourceAccessor.readFileSync('/dev/stdin', 'utf8');

const expressionLines = streamContent.trim().split('\n');

const operatorFunctions = {
    '+': (first, second) => first + second,
    '-': (first, second) => first - second,
    '*': (first, second) => first * second,
    '/': (first, second) => first / second
};

const parsedOperations = [];
for (let iterator = 1; iterator < expressionLines.length - 1; iterator += 2) {
    parsedOperations.push({
        operatorSymbol: expressionLines[iterator],
        numericOperand: Number(expressionLines[iterator + 1])
    });
}

const startingValue = Number(expressionLines[0]);

const processedCalculation = parsedOperations.reduce((currentAccumulator, nextOperation) => {
    const opFn = operatorFunctions[nextOperation.operatorSymbol];
    let intermediateResult;

    if (opFn) {
        intermediateResult = opFn(currentAccumulator, nextOperation.numericOperand);
    } else {
        intermediateResult = currentAccumulator;
    }

    return Number(intermediateResult.toFixed(0));
}, startingValue);

console.log(String(processedCalculation));