function calculateAscendingCost(inputCollection) {
    if (inputCollection.length === 0) {
        return 0;
    }

    const { currentSum: finalCost } = inputCollection.reduce((acc, currentVal, idx) => {
        if (idx === 0) {
            return { lastAdjusted: currentVal, currentSum: 0 };
        } else {
            let sumSoFar = acc.currentSum;
            let prevAdjusted = acc.lastAdjusted;
            let currentConsidered = currentVal;

            if (prevAdjusted >= currentConsidered) {
                let requiredGap = prevAdjusted - currentConsidered + 1;
                sumSoFar += requiredGap;
                currentConsidered = prevAdjusted + 1;
            }
            return { lastAdjusted: currentConsidered, currentSum: sumSoFar };
        }
    }, { lastAdjusted: 0, currentSum: 0 }); // Initial state for reduce, 'lastAdjusted' is overwritten at idx 0

    return finalCost;
}

function outputFinalResult(value) {
    console.log(value);
}

function determineOptimalAdjustment(elementCount, minimumSelection, originalSequence) {
    if (minimumSelection === 1) {
        outputFinalResult(0);
        return;
    }

    const initialValue = originalSequence[0];
    const subsequentValues = originalSequence.slice(1);

    const potentialSubgroups = [];

    function buildAllSubsets(sourceArray, idx, currentSet, resultContainer) {
        if (idx === sourceArray.length) {
            resultContainer.push(currentSet);
            return;
        }

        buildAllSubsets(sourceArray, idx + 1, currentSet, resultContainer);

        buildAllSubsets(sourceArray, idx + 1, [...currentSet, sourceArray[idx]], resultContainer);
    }

    buildAllSubsets(subsequentValues, 0, [], potentialSubgroups);

    const evaluatedCollections = potentialSubgroups.map(subset => [initialValue, ...subset]);

    let finalMinimum = Number.MAX_SAFE_INTEGER;

    for (const collectionToEvaluate of evaluatedCollections) {
        if (collectionToEvaluate.length >= minimumSelection) {
            const evaluationCost = calculateAscendingCost(collectionToEvaluate);
            finalMinimum = Math.min(finalMinimum, evaluationCost);
        }
    }

    outputFinalResult(finalMinimum);
}