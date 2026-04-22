const evaluateInputData = sourceMaterial => {
    const numericStrings = sourceMaterial.match(/\d+/g);
    const numericalElements = numericStrings.slice(1).map(val => BigInt(val));

    const ceilingValue = BigInt(10) ** BigInt(18);

    const initialAccumulator = { currentResult: 1n, zeroFound: false, limitExceeded: false };

    const finalOutcome = numericalElements.reduce((computationState, currentOperand) => {
        if (computationState.zeroFound || computationState.limitExceeded) {
            return computationState;
        }

        if (currentOperand === 0n) {
            computationState.zeroFound = true;
            return computationState;
        }

        computationState.currentResult *= currentOperand;

        if (computationState.currentResult > ceilingValue) {
            computationState.limitExceeded = true;
        }

        return computationState;
    }, initialAccumulator);

    if (finalOutcome.zeroFound) {
        console.log(0);
    } else if (finalOutcome.limitExceeded) {
        console.log(-1);
    } else {
        console.log(finalOutcome.currentResult.toString());
    }
};

evaluateInputData(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));