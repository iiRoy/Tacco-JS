const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = rawData.trim().split("\n");

const parseDimensionsFromLine = (lineString) => {
    const parts = lineString.split(" ").map(Number);
    return { numElements: parts[0], targetSum: parts[1] };
};

const generateAllPairwiseSums = (sourceArray) => {
    const generatedSums = [];
    const arrayLength = sourceArray.length;
    for (let outerIndex = 0; outerIndex < arrayLength; outerIndex++) {
        for (let innerIndex = outerIndex; innerIndex < arrayLength; innerIndex++) {
            generatedSums.push(sourceArray[outerIndex] + sourceArray[innerIndex]);
        }
    }
    return generatedSums;
};

const findMaxSumWithinTarget = (sortedSumsArray, targetLimit) => {
    let currentMaxAchievedSum = 0;
    let rightPointerIndex = sortedSumsArray.length - 1;

    for (let leftPointerIndex = 0; leftPointerIndex < sortedSumsArray.length; leftPointerIndex++) {
        const leftValue = sortedSumsArray[leftPointerIndex];

        while (leftValue + sortedSumsArray[rightPointerIndex] > targetLimit) {
            rightPointerIndex--;
        }
        currentMaxAchievedSum = Math.max(currentMaxAchievedSum, leftValue + sortedSumsArray[rightPointerIndex]);
    }
    return currentMaxAchievedSum;
};

while (true) {
    const currentDimensionLine = lines.shift();
    const { numElements: n, targetSum: m } = parseDimensionsFromLine(currentDimensionLine);

    if (n === 0 && m === 0) {
        break;
    }

    const numericDataCollection = [];
    for (let dataIdx = 0; dataIdx < n; dataIdx++) {
        numericDataCollection.push(Number(lines.shift()));
    }
    numericDataCollection.push(0);

    let allPairSums = generateAllPairwiseSums(numericDataCollection);

    allPairSums.sort((valA, valB) => valA - valB);

    const finalResultSum = findMaxSumWithinTarget(allPairSums, m);

    console.log(finalResultSum);
}
