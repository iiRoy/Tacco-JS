const processContent = (rawData) => {
    const textSegments = rawData.split('\n');
    const segmentCount = Number(textSegments[0]);
    const numericalArray = textSegments[1].split(' ').map(Number);
    return { quantity: segmentCount, values: numericalArray };
};

const partition = (items, leftPointer, rightPointer, pivotIndex) => {
    const pivotValue = items[pivotIndex];
    [items[pivotIndex], items[rightPointer]] = [items[rightPointer], items[pivotIndex]];
    let storeIndex = leftPointer;
    for (let i = leftPointer; i < rightPointer; i++) {
        if (items[i] < pivotValue) {
            [items[storeIndex], items[i]] = [items[i], items[storeIndex]];
            storeIndex++;
        }
    }
    [items[rightPointer], items[storeIndex]] = [items[storeIndex], items[rightPointer]];
    return storeIndex;
};

const findRankedElement = (dataCollection, rank) => {
    let lowBoundary = 0;
    let highBoundary = dataCollection.length - 1;

    while (true) {
        if (lowBoundary === highBoundary) {
            return dataCollection[lowBoundary];
        }

        let pivotLocation = Math.floor(Math.random() * (highBoundary - lowBoundary + 1)) + lowBoundary;
        pivotLocation = partition(dataCollection, lowBoundary, highBoundary, pivotLocation);

        if (rank === pivotLocation) {
            return dataCollection[rank];
        } else if (rank < pivotLocation) {
            highBoundary = pivotLocation - 1;
        } else {
            lowBoundary = pivotLocation + 1;
        }
    }
};

const extractCentralValues = (sourceNumbers, totalSize) => {
    const firstRank = (totalSize / 2) - 1;
    const secondRank = (totalSize / 2);

    const tempCollectionOne = Array.from(sourceNumbers);
    const tempCollectionTwo = Array.from(sourceNumbers);

    const firstValue = findRankedElement(tempCollectionOne, firstRank);
    const secondValue = findRankedElement(tempCollectionTwo, secondRank);

    return { firstThreshold: Math.min(firstValue, secondValue), secondThreshold: Math.max(firstValue, secondValue) };
};

const generateOutputs = (originalData, lowerBound, upperBound) => {
    const calculatedResults = originalData.map(itemValue => {
        let outputItem;
        if (itemValue <= lowerBound) {
            outputItem = upperBound;
        } else {
            outputItem = lowerBound;
        }
        return outputItem;
    });
    return calculatedResults.join('\n');
};

const displayResults = (rawTextContent) => {
    const processedData = processContent(rawTextContent);
    const { quantity, values } = processedData;

    const { firstThreshold, secondThreshold } = extractCentralValues(values, quantity);

    const finalOutputString = generateOutputs(values, firstThreshold, secondThreshold);
    console.log(finalOutputString);
};

const acquiredText = require('fs').readFileSync("/dev/stdin","utf-8");
displayResults(acquiredText);