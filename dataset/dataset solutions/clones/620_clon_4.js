const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedSegments = (sourceData.trim()).split("\n");

const initialOperand = Number(parsedSegments[0]);

const opHandlers = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
};

const operationSequence = [];
for (let k = 1; k < parsedSegments.length - 1; k += 2) {
    operationSequence.push({
        symbol: parsedSegments[k],
        value: Number(parsedSegments[k + 1])
    });
}

const finalOutcome = operationSequence.reduce((currentEvaluation, stepDetails) => {
    const performOperation = opHandlers[stepDetails.symbol];
    let intermediateResult = performOperation(currentEvaluation, stepDetails.value);
    return Number(intermediateResult.toFixed(0));
}, initialOperand);

console.log(finalOutcome);
