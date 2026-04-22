(function() {
    const dataStreamProcessor = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    let collectedInputLines = [];
    dataStreamProcessor.on('line', (individualLine) => {
        collectedInputLines.push(individualLine);
    });
    dataStreamProcessor.on('close', () => {
        const interpretNumericString = (textValue) => textValue.split(" ").map(Number);

        const initialParameters = interpretNumericString(collectedInputLines[0]);
        const totalElements = initialParameters[0];
        const requiredQuantity = initialParameters[1];
        const rawElementValues = interpretNumericString(collectedInputLines[1]);

        if (requiredQuantity === 1) {
            console.log(0);
            return;
        }

        let overallMinimalCost = Number.MAX_SAFE_INTEGER;

        const calculateAdjustedExpense = (sequenceToEvaluate) => {
            if (sequenceToEvaluate.length <= 1) return 0;

            const finalOutcome = sequenceToEvaluate.slice(1).reduce(
                (accumulatorResult, currentItemValue) => {
                    let currentAccumulatedExpense = accumulatorResult.currentCalculatedExpense;
                    let lastKnownAdjustedValue = accumulatorResult.lastModifiedElement;

                    if (currentItemValue <= lastKnownAdjustedValue) {
                        let necessaryIncrease = lastKnownAdjustedValue - currentItemValue + 1;
                        currentAccumulatedExpense += necessaryIncrease;
                        lastKnownAdjustedValue += necessaryIncrease; 
                    } else {
                        lastKnownAdjustedValue = currentItemValue;
                    }
                    return { currentCalculatedExpense: currentAccumulatedExpense, lastModifiedElement: lastKnownAdjustedValue };
                },
                { currentCalculatedExpense: 0, lastModifiedElement: sequenceToEvaluate[0] }
            );
            return finalOutcome.currentCalculatedExpense;
        };

        const generateAndProcessSubsequences = (focusIndex, currentSequenceValues) => {
            if (focusIndex === totalElements) {
                if (currentSequenceValues.length >= requiredQuantity) {
                    const currentPathExpense = calculateAdjustedExpense(currentSequenceValues);
                    overallMinimalCost = Math.min(overallMinimalCost, currentPathExpense);
                }
                return;
            }

            // Branch 1: Incorporate the element at focusIndex
            generateAndProcessSubsequences(focusIndex + 1, currentSequenceValues.concat(rawElementValues[focusIndex]));

            // Branch 2: Exclude the element at focusIndex
            generateAndProcessSubsequences(focusIndex + 1, currentSequenceValues);
        };

        // Initiating the process; the first element is always included.
        generateAndProcessSubsequences(1, [rawElementValues[0]]);

        console.log(overallMinimalCost);
    });
})();