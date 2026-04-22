const factorialProduct = (upperBoundValue, termsCount) => {
    if (termsCount <= 0) return 1;
    let productAccumulator = 1;
    for (let currentTermIdx = 0; currentTermIdx < termsCount; ++currentTermIdx) {
        productAccumulator *= (upperBoundValue - currentTermIdx);
    }
    return productAccumulator;
};

const waysToSelect = (totalAvailable, chosenCount) => {
    // Replicates the original combination function's specific behavior for non-positive chosenCount.
    // Original permutation(n,r) returns 1 for r <= 0.
    // So, permutation(chosenCount, chosenCount) for chosenCount <= 0 also returns 1.
    // Thus, combination(n,r) for r <= 0 returns 1 / 1 = 1.
    if (chosenCount < 0) {
        return 1;
    }
    return factorialProduct(totalAvailable, chosenCount) / factorialProduct(chosenCount, chosenCount);
};

const processInputData = (completeInputString) => {
    const inputSegments = completeInputString.trim().split('\n');
    const firstLineAttributes = inputSegments[0].split(' ');
    const totalItemCount = Number(firstLineAttributes[0]);
    const averageGroupSize = Number(firstLineAttributes[1]);
    const maxCombinationRange = Number(firstLineAttributes[2]);

    const itemValueStrings = inputSegments[1].split(' ');
    const numericalItemValues = itemValueStrings.map(Number);

    const descendingSortedValues = [...numericalItemValues].sort((valueOne, valueTwo) => valueTwo - valueOne);

    let topValuesSum = 0;
    let valueFrequencyMap = new Map();

    for (let itemIndex = 0; itemIndex < totalItemCount; ++itemIndex) {
        if (itemIndex < averageGroupSize) {
            topValuesSum += descendingSortedValues[itemIndex];
        }
        valueFrequencyMap.set(descendingSortedValues[itemIndex], (valueFrequencyMap.get(descendingSortedValues[itemIndex]) || 0) + 1);
    }

    const calculatedAverage = topValuesSum / averageGroupSize;
    console.log(calculatedAverage);

    let computedSelectionWays = 0;
    let currentIterationTally = 0;

    if (descendingSortedValues[0] === descendingSortedValues[averageGroupSize]) {
        // This branch replicates the original's hardcoded '50' and loop from '1'.
        // This is an unusual specific behavior which must be mirrored exactly.
        const fixedValueForCombinations = 50;
        for (let loopCount = 1; loopCount <= maxCombinationRange; ++loopCount) {
            computedSelectionWays += waysToSelect(fixedValueForCombinations, loopCount);
        }
    } else {
        computedSelectionWays = 1; // Initial value for this branch, replicating 'comb = 1'

        // Replicates Object.keys(C).length as the upper bound for the loop.
        // This means iterating through the first 'distinctElementQuantity' elements of the sorted array.
        const distinctElementQuantity = valueFrequencyMap.size;

        for (let loopIndex = 0; loopIndex < distinctElementQuantity; ++loopIndex) {
            const currentItemFromSorted = descendingSortedValues[loopIndex];
            const totalOccurrencesOfCurrentItem = valueFrequencyMap.get(currentItemFromSorted);

            if (totalOccurrencesOfCurrentItem >= 2) {
                let dynamicSelectionCount;
                const remainingSlotsForAverage = averageGroupSize - currentIterationTally;

                if (totalOccurrencesOfCurrentItem > remainingSlotsForAverage) {
                    dynamicSelectionCount = remainingSlotsForAverage;
                } else {
                    dynamicSelectionCount = totalOccurrencesOfCurrentItem;
                }
                computedSelectionWays *= waysToSelect(totalOccurrencesOfCurrentItem, dynamicSelectionCount);
                currentIterationTally += totalOccurrencesOfCurrentItem;
            } else {
                currentIterationTally += totalOccurrencesOfCurrentItem;
            }
        }
    }
    console.log(computedSelectionWays);
};

let bufferedInputContent = '';
process.stdin.on('data', (inputChunk) => {
    bufferedInputContent += inputChunk.toString();
});
process.stdin.on('end', () => {
    processInputData(bufferedInputContent);
});