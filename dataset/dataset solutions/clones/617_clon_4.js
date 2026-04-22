const sourceMaterial = require('fs').readFileSync('/dev/stdin', 'utf8');

const instructionSet = sourceMaterial.trim().split('\n');

let currentAccumulator = Number(instructionSet[0]);

const operationSequence = [];
for (let j = 1; j < instructionSet.length; j += 2) {
    const operatorSymbol = instructionSet[j];
    if (operatorSymbol === '=') {
        break;
    }
    const numericOperand = Number(instructionSet[j + 1]);
    operationSequence.push({
        symbol: operatorSymbol,
        value: numericOperand
    });
}

const mathActions = {
    '+': (previousValue, currentValue) => previousValue + currentValue,
    '-': (previousValue, currentValue) => previousValue - currentValue,
    '*': (previousValue, currentValue) => previousValue * currentValue,
    '/': (previousValue, currentValue) => previousValue / currentValue,
};

const finalOutcome = operationSequence.reduce((processingResult, instructionEntry) => {
    const operationHandler = mathActions[instructionEntry.symbol];
    if (operationHandler) {
        const temporaryCalculation = operationHandler(processingResult, instructionEntry.value);
        return Math.trunc(temporaryCalculation);
    }
    return processingResult;
}, currentAccumulator);

console.log(finalOutcome);