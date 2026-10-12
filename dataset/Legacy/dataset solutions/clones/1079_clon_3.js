const readline = require('readline');

const inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let storedInputLines = [];
let currentLineIndex = 0;

inputReader.on('line', (lineContent) => {
    storedInputLines.push(lineContent);
});

inputReader.on('close', () => {
    executeMainLogic();
});

const retrieveInteger = () => {
    const value = parseInt(storedInputLines[currentLineIndex], 10);
    currentLineIndex++;
    return value;
};

const performQuickSort = (dataArray, arraySize, comparator) => {
    const exchangeElements = (firstIdx, secondIdx) => {
        const temporaryValue = dataArray[firstIdx];
        dataArray[firstIdx] = dataArray[secondIdx];
        dataArray[secondIdx] = temporaryValue;
    };

    const divideAndConquer = (startIndex, endIndex) => {
        const pivotValue = dataArray[endIndex];
        let pivotPlacementIndex = startIndex;

        for (let currentElementIndex = startIndex; currentElementIndex < endIndex; currentElementIndex++) {
            if (comparator(dataArray[currentElementIndex], pivotValue) <= 0) {
                exchangeElements(pivotPlacementIndex, currentElementIndex);
                pivotPlacementIndex++;
            }
        }
        exchangeElements(pivotPlacementIndex, endIndex);
        return pivotPlacementIndex;
    };

    const recursiveSort = (lowBound, highBound) => {
        if (lowBound >= highBound) {
            return;
        }
        const pivotFinalIndex = divideAndConquer(lowBound, highBound);
        recursiveSort(lowBound, pivotFinalIndex - 1);
        recursiveSort(pivotFinalIndex + 1, highBound);
    };

    recursiveSort(0, arraySize - 1);
};

const calculateMinimumCost = (inputValues, totalElements) => {
    const sortedValues = [...inputValues];
    const numericComparator = (valA, valB) => valA - valB;
    performQuickSort(sortedValues, totalElements, numericComparator);

    const maxSortedValue = sortedValues[totalElements - 1];
    const valueToIndexMap = Array(maxSortedValue + 1).fill(0);
    sortedValues.forEach((elementValue, sortedIndex) => {
        valueToIndexMap[elementValue] = sortedIndex;
    });

    const isVisited = Array(totalElements).fill(false);

    const getCycleElements = (startingIndex) => {
        const cyclePath = [];

        const traceCyclePath = (currentIndex) => {
            isVisited[currentIndex] = true;
            const elementInOriginal = inputValues[currentIndex];
            cyclePath.push(elementInOriginal);

            const nextIndexInCycle = valueToIndexMap[elementInOriginal];

            if (isVisited[nextIndexInCycle]) {
                return;
            } else {
                traceCyclePath(nextIndexInCycle);
            }
        };

        traceCyclePath(startingIndex);
        return cyclePath;
    };

    const processCyclesRecursively = (currentIndex, cumulativeCost) => {
        if (currentIndex === totalElements) {
            return cumulativeCost;
        }

        if (isVisited[currentIndex]) {
            return processCyclesRecursively(currentIndex + 1, cumulativeCost);
        }

        const currentCycleElements = getCycleElements(currentIndex);
        const cycleElementCount = currentCycleElements.length;

        const cycleElementsSum = currentCycleElements.reduce((sum, val) => sum + val, 0);
        const cycleMinimumValue = Math.min(...currentCycleElements);

        const FACTOR_TWO = 2;
        const FACTOR_ONE = 1;

        const costOptionA = cycleElementsSum + (cycleElementCount - FACTOR_TWO) * cycleMinimumValue;
        const smallestOverallElement = sortedValues[0];
        const costOptionB = cycleElementsSum + cycleMinimumValue + (cycleElementCount + FACTOR_ONE) * smallestOverallElement;

        const cycleContribution = Math.min(costOptionA, costOptionB);

        return processCyclesRecursively(currentIndex + 1, cumulativeCost + cycleContribution);
    };

    return processCyclesRecursively(0, 0);
};

const executeMainLogic = () => {
    const inputCount = retrieveInteger();
    const initialArray = [];
    for (let i = 0; i < inputCount; i++) {
        initialArray.push(retrieveInteger());
    }

    const finalCalculatedCost = calculateMinimumCost(initialArray, inputCount);
    console.log(finalCalculatedCost);
};
