const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processArithmeticSequence = (expressionContent) => {
    const operationTokens = expressionContent.trim().split(/\s+/).filter(Boolean);

    if (operationTokens.length === 0) {
        return 0;
    }

    const initialNumericOperand = Number(operationTokens[0]);

    const operatorActionMap = {
        '+': (currentVal, nextVal) => currentVal + nextVal,
        '-': (currentVal, nextVal) => currentVal - nextVal,
        '*': (currentVal, nextVal) => currentVal * nextVal,
        '/': (currentVal, nextVal) => currentVal / nextVal,
    };

    const recursiveCalculation = (currentAccumulator, remainingInstructionSet) => {
        if (remainingInstructionSet.length === 0 || remainingInstructionSet[0] === '=') {
            return currentAccumulator;
        }

        const operatorIndicator = remainingInstructionSet[0];
        const succeedingNumericValue = Number(remainingInstructionSet[1]);

        const activeOperation = operatorActionMap[operatorIndicator];
        if (!activeOperation) {
            // If an unknown operator is encountered, cease calculation as per original's implicit behavior
            return currentAccumulator;
        }

        let interimResult = activeOperation(currentAccumulator, succeedingNumericValue);
        interimResult = Math.round(interimResult); // Equivalent to .toFixed(0)-0 for rounding

        return recursiveCalculation(interimResult, remainingInstructionSet.slice(2));
    };

    const finalEvaluatedValue = recursiveCalculation(initialNumericOperand, operationTokens.slice(1));
    return finalEvaluatedValue;
};

console.log(processArithmeticSequence(sourceData));