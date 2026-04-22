const utilizeValueSwapper = (elementSeries, positionA, positionB) => {
    const temporaryValueHolder = elementSeries[positionA];
    elementSeries[positionA] = elementSeries[positionB];
    elementSeries[positionB] = temporaryValueHolder;
};

const implementQuickSortingMechanism = (inputCollection, collectionSize, orderingPredicate) => {
    if (!inputCollection || collectionSize <= 1) {
        return;
    }

    const arrangePartitionBoundaries = (lowerIndex, upperIndex) => {
        const pivotElementReference = inputCollection[upperIndex];
        let separationPoint = lowerIndex - 1;

        for (let currentScanPosition = lowerIndex; currentScanPosition < upperIndex; currentScanPosition++) {
            if (orderingPredicate(inputCollection[currentScanPosition], pivotElementReference) <= 0) {
                separationPoint++;
                utilizeValueSwapper(inputCollection, separationPoint, currentScanPosition);
            }
        }
        utilizeValueSwapper(inputCollection, separationPoint + 1, upperIndex);
        return separationPoint + 1;
    };

    const processSubArraySegments = (startingBoundary, endingBoundary) => {
        if (startingBoundary < endingBoundary) {
            const partitionAnchorIndex = arrangePartitionBoundaries(startingBoundary, endingBoundary);
            processSubArraySegments(startingBoundary, partitionAnchorIndex - 1);
            processSubArraySegments(partitionAnchorIndex + 1, endingBoundary);
        }
    };

    processSubArraySegments(0, collectionSize - 1);
};

const computeCycleTransformationCost = (initialSequence, sequenceExtent) => {
    if (!Array.isArray(initialSequence) || initialSequence.length !== sequenceExtent) {
        return -1; // Indicate an error or invalid input.
    }
    if (sequenceExtent === 0) {
        return 0;
    }

    const sortedSequenceCopy = initialSequence.slice();
    implementQuickSortingMechanism(sortedSequenceCopy, sequenceExtent, (val1, val2) => val1 - val2);

    const highestElementValue = sortedSequenceCopy[sequenceExtent - 1];
    const elementValueToSortedIndexMap = new Array(highestElementValue + 1).fill(-1);

    for (let currentSortedIndex = 0; currentSortedIndex < sequenceExtent; currentSortedIndex++) {
        elementValueToSortedIndexMap[sortedSequenceCopy[currentSortedIndex]] = currentSortedIndex;
    }

    const visitedElementTracker = new Array(sequenceExtent).fill(false);
    const overallMinimumValue = sortedSequenceCopy[0];
    let cumulativePermutationCost = 0;

    const extractCycleComponents = (startingPoint, currentCycleAccumulator) => {
        visitedElementTracker[startingPoint] = true;
        currentCycleAccumulator.push(initialSequence[startingPoint]);

        const valueAtCurrentOriginalPosition = initialSequence[startingPoint];
        const nextTargetIndexInSorted = elementValueToSortedIndexMap[valueAtCurrentOriginalPosition];

        if (!visitedElementTracker[nextTargetIndexInSorted]) {
            extractCycleComponents(nextTargetIndexInSorted, currentCycleAccumulator);
        }
    };

    let currentIndexIterator = 0;
    while (currentIndexIterator < sequenceExtent) {
        if (visitedElementTracker[currentIndexIterator]) {
            currentIndexIterator++;
            continue;
        }

        const discoveredCycleValues = [];
        extractCycleComponents(currentIndexIterator, discoveredCycleValues);

        const currentCycleLength = discoveredCycleValues.length;
        const currentCycleSum = discoveredCycleValues.reduce((total, val) => total + val, 0);
        const currentCycleSmallestValue = Math.min(...discoveredCycleValues);

        const costFormulaOne = currentCycleSum + (currentCycleLength - 2) * currentCycleSmallestValue;
        const costFormulaTwo = currentCycleSum + currentCycleSmallestValue + (currentCycleLength + 1) * overallMinimumValue;

        cumulativePermutationCost += Math.min(costFormulaOne, costFormulaTwo);
        currentIndexIterator++;
    }

    return cumulativePermutationCost;
};

// Example usage (not part of the final output, but for testing purposes)
/*
const testN = 5;
const testArray = [1, 5, 2, 4, 3];
const result = computeCycleTransformationCost(testArray, testN);
console.log(result); // Should output 12 based on the OCaml logic trace
*/