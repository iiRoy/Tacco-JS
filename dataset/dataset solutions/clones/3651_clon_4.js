function strToNum(inputStr) {
    return Number.parseFloat(inputStr);
}

function absoluteVal(inputNum) {
    return inputNum < 0 ? -inputNum : inputNum;
}

function customNumericDescendingCompare(firstElement, secondElement) {
    const numericA = strToNum(firstElement);
    const numericB = strToNum(secondElement);

    if (Number.isNaN(numericA) && Number.isNaN(numericB)) {
        return 0;
    }
    if (Number.isNaN(numericA)) {
        return 1;
    }
    if (Number.isNaN(numericB)) {
        return -1;
    }

    return numericB - numericA;
}

function divideAndArrange(dataCollection, lowerBoundary, upperBoundary, compareFunction) {
    const pivotValue = dataCollection[upperBoundary];
    let greaterOrEqualIndex = lowerBoundary - 1;

    for (let currentElementIndex = lowerBoundary; currentElementIndex < upperBoundary; currentElementIndex++) {
        if (compareFunction(dataCollection[currentElementIndex], pivotValue) <= 0) {
            greaterOrEqualIndex++;
            let temporaryHolder = dataCollection[greaterOrEqualIndex];
            dataCollection[greaterOrEqualIndex] = dataCollection[currentElementIndex];
            dataCollection[currentElementIndex] = temporaryHolder;
        }
    }

    let temporaryHolder = dataCollection[greaterOrEqualIndex + 1];
    dataCollection[greaterOrEqualIndex + 1] = dataCollection[upperBoundary];
    dataCollection[upperBoundary] = temporaryHolder;

    return greaterOrEqualIndex + 1;
}

function arrangeOrder(dataCollection, lowerBoundary, upperBoundary, compareFunction) {
    if (lowerBoundary < upperBoundary) {
        const partitionPosition = divideAndArrange(dataCollection, lowerBoundary, upperBoundary, compareFunction);
        arrangeOrder(dataCollection, lowerBoundary, partitionPosition - 1, compareFunction);
        arrangeOrder(dataCollection, partitionPosition + 1, upperBoundary, compareFunction);
    }
}

function separateIntoParts(sourceString) {
    let segmentsHolder = [];
    let currentSegmentAccumulator = "";
    for (let charIndex = 0; charIndex < sourceString.length; charIndex++) {
        if (sourceString[charIndex] === ' ') {
            segmentsHolder.push(currentSegmentAccumulator);
            currentSegmentAccumulator = "";
        } else {
            currentSegmentAccumulator += sourceString[charIndex];
        }
    }
    segmentsHolder.push(currentSegmentAccumulator);
    return segmentsHolder;
}

function computeAbsoluteDifferenceSum(sequenceArray, currentIndex, currentTotalAccumulator) {
    if (currentIndex >= sequenceArray.length) {
        return currentTotalAccumulator;
    }
    const previousElementVal = strToNum(sequenceArray[currentIndex - 1]);
    const currentElementVal = strToNum(sequenceArray[currentIndex]);
    const differenceMagnitude = absoluteVal(currentElementVal - previousElementVal);
    return computeAbsoluteDifferenceSum(sequenceArray, currentIndex + 1, currentTotalAccumulator + differenceMagnitude);
}

function orchestrateCalculation(sourceInputData) {
    const inputSegments = separateIntoParts(sourceInputData);

    const mutableCollection = Array.from(inputSegments);

    if (mutableCollection.length > 1) {
        arrangeOrder(mutableCollection, 0, mutableCollection.length - 1, customNumericDescendingCompare);
    }

    let finalAccumulatedValue = 0;
    if (mutableCollection.length > 1) {
        finalAccumulatedValue = computeAbsoluteDifferenceSum(mutableCollection, 1, 0);
    }

    process.stdout.write(finalAccumulatedValue.toString() + '\n');
}

const fileSystemInterface = require('node:fs');
const rawInputContent = fileSystemInterface.readFileSync(0, 'utf8');

orchestrateCalculation(rawInputContent);