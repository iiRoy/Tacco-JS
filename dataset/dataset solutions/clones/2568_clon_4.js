const filesystem = require('fs');

const applyHalvingRecursively = (currentVal, opsAvailable, lowerBound) => {
    if (opsAvailable <= 0 || currentVal < lowerBound) {
        return { resultantValue: currentVal, opsExpended: 0 };
    }
    const nextVal = Math.floor(currentVal / 2);
    const subsequentResult = applyHalvingRecursively(nextVal, opsAvailable - 1, lowerBound);
    return {
        resultantValue: subsequentResult.resultantValue,
        opsExpended: subsequentResult.opsExpended + 1
    };
};

const processInputData = (inputLines) => {
    const rawParameters = inputLines[0].split(' ').map(Number);
    const totalItemCount = rawParameters[0];
    const initialOperationBudget = rawParameters[1];
    const itemValueCollection = inputLines[1].split(' ').map(Number);

    const orderedValueCollection = [...itemValueCollection].sort((valA, valB) => valB - valA);

    const finalAccumulationState = orderedValueCollection.reduce(
        (currentAccumulator, currentItemEntry, currentIndex, fullArray) => {
            let [overallRunningSum, remainingOperationBudget] = currentAccumulator;

            const nextItemInSequence = fullArray[currentIndex + 1];
            const effectiveComparisonLimit =
                (currentIndex < totalItemCount - 1)
                    ? Math.min(nextItemInSequence, 4)
                    : 0;

            const reductionResult = applyHalvingRecursively(
                currentItemEntry,
                remainingOperationBudget,
                effectiveComparisonLimit
            );

            overallRunningSum += reductionResult.resultantValue;
            remainingOperationBudget -= reductionResult.opsExpended;

            return [overallRunningSum, remainingOperationBudget];
        },
        [0, initialOperationBudget]
    );

    return finalAccumulationState[0];
};

const acquireAndProcess = () => {
    const stdinContent = filesystem.readFileSync("/dev/stdin", "UTF-8");
    const linesOfInput = stdinContent.split("\n");
    const finalCalculatedSum = processInputData(linesOfInput);
    console.log(finalCalculatedSum);
};

acquireAndProcess();