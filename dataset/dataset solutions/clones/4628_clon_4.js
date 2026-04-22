const processInput = (rawText) => {
    const linesOfData = rawText.trim().split('\n');
    const numericValues = linesOfData[1].split(' ').map(Number);

    const initialCalculationState = {
        cumulativeSum: numericValues[0],
        adjustmentOperations: 0
    };

    const finalCalculationState = numericValues.slice(1).reduce((currentAccumulation, currentNumber) => {
        let { cumulativeSum, adjustmentOperations } = currentAccumulation;

        const potentialNewSum = cumulativeSum + currentNumber;

        if (cumulativeSum >= 0) {
            if (potentialNewSum >= 0) {
                const operationsRequired = potentialNewSum + 1;
                adjustmentOperations += operationsRequired;
                cumulativeSum = -1;
            } else {
                cumulativeSum = potentialNewSum;
            }
        } else {
            if (potentialNewSum <= 0) {
                const operationsRequired = Math.abs(potentialNewSum) + 1;
                adjustmentOperations += operationsRequired;
                cumulativeSum = 1;
            } else {
                cumulativeSum = potentialNewSum;
            }
        }

        return { cumulativeSum, adjustmentOperations };
    }, initialCalculationState);

    console.log(finalCalculationState.adjustmentOperations);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));