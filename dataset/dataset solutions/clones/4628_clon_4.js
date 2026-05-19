const processSequence = (inputData) => {
    const dataLines = inputData.trim().split("\n");
    const elementCount = parseInt(dataLines[0], 10);
    const numericSequence = dataLines[1].split(" ").map(Number);

    const initialAccumulatorState = {
        cumulativeSum: numericSequence[0],
        operationTally: 0
    };

    const finalResult = numericSequence.slice(1).reduce((currentAccumulator, originalValue) => {
        let { cumulativeSum, operationTally } = currentAccumulator;
        let mutableValue = originalValue;
        let currentAdjustments = 0;

        // First adjustment phase: If cumulative sum is non-negative, ensure the sum after adding
        // the current element becomes non-positive.
        // This corresponds to the first 'while' loop in the original logic.
        if (cumulativeSum >= 0) {
            if (cumulativeSum + mutableValue >= 0) {
                // The target for (cumulativeSum + mutableValue) is -1.
                // So, mutableValue needs to become (-1 - cumulativeSum).
                const targetElementForNegativeSum = -1 - cumulativeSum;
                currentAdjustments += Math.abs(mutableValue - targetElementForNegativeSum);
                mutableValue = targetElementForNegativeSum;
            }
        }
        
        // Second adjustment phase: If cumulative sum is non-positive, ensure the sum after adding
        // the current (potentially modified) element becomes non-negative.
        // This corresponds to the second 'while' loop in the original logic.
        // Note: 'cumulativeSum' itself is not updated between these two phases for the current element.
        if (cumulativeSum <= 0) {
            if (cumulativeSum + mutableValue <= 0) {
                // The target for (cumulativeSum + mutableValue) is 1.
                // So, mutableValue needs to become (1 - cumulativeSum).
                const targetElementForPositiveSum = 1 - cumulativeSum;
                currentAdjustments += Math.abs(mutableValue - targetElementForPositiveSum);
                mutableValue = targetElementForPositiveSum;
            }
        }

        // Accumulate total operations
        operationTally += currentAdjustments;
        // Update cumulative sum for the next iteration
        cumulativeSum += mutableValue;

        return {
            cumulativeSum: cumulativeSum,
            operationTally: operationTally
        };
    }, initialAccumulatorState);

    console.log(finalResult.operationTally);
};

processSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
