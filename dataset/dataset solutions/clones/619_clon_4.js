const rawDataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

const contentLines = rawDataStream.trim().split('\n');

let initialNumericValue = Number(contentLines[0]);

const arithmeticSequence = [];
for (let operationIndex = 1; operationIndex < contentLines.length; operationIndex += 2) {
    const currentSymbol = contentLines[operationIndex];
    if (currentSymbol === '=') {
        break;
    }
    const currentNumericOperand = Number(contentLines[operationIndex + 1]);
    arithmeticSequence.push({
        indicator: currentSymbol,
        magnitude: currentNumericOperand
    });
}

const actionPerformers = {
    '+': (base, factor) => base + factor,
    '-': (base, factor) => base - factor,
    '*': (base, factor) => base * factor,
    '/': (base, factor) => base / factor
};

const processedOutcome = arithmeticSequence.reduce((currentAccumulator, stepDetails) => {
    const specificAction = actionPerformers[stepDetails.indicator];
    if (specificAction) {
        let interimResult = specificAction(currentAccumulator, stepDetails.magnitude);
        return Math.round(interimResult);
    }
    return currentAccumulator;
}, initialNumericValue);

console.log(processedOutcome);