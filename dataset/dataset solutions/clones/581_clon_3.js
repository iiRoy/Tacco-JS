const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

let inputLines = fileContent.trim().split('\n');
let currentLineIndex = 0;

const getNextLine = () => inputLines[currentLineIndex++];
const parseLineToNumbers = (lineString) => lineString.split(' ').map(Number);

const generateCombinations = (valuesArray) => {
    const combinationsList = [];
    const arrayLength = valuesArray.length;
    for (let firstElementIdx = 0; firstElementIdx < arrayLength; firstElementIdx++) {
        for (let secondElementIdx = firstElementIdx; secondElementIdx < arrayLength; secondElementIdx++) {
            combinationsList.push(valuesArray[firstElementIdx] + valuesArray[secondElementIdx]);
        }
    }
    return combinationsList;
};

const findMaxSumUnderLimit = (sortedSumsArray, upperLimit) => {
    let currentMaximumSum = 0;
    const totalSumsCount = sortedSumsArray.length;
    for (let outerLoopIdx = 0; outerLoopIdx < totalSumsCount; outerLoopIdx++) {
        for (let innerLoopIdx = outerLoopIdx; innerLoopIdx < totalSumsCount; innerLoopIdx++) {
            const potentialResultSum = sortedSumsArray[outerLoopIdx] + sortedSumsArray[innerLoopIdx];
            if (potentialResultSum > upperLimit) {
                break;
            }
            if (potentialResultSum > currentMaximumSum) {
                currentMaximumSum = potentialResultSum;
            }
        }
    }
    return currentMaximumSum;
};

while (true) {
    const dimensionsLine = getNextLine();
    const [numElements, limitValue] = parseLineToNumbers(dimensionsLine);

    if (numElements === 0 && limitValue === 0) {
        break;
    }

    const elementValues = [];
    for (let elementIdx = 0; elementIdx < numElements; elementIdx++) {
        const valueString = getNextLine();
        elementValues.push(Number(valueString));
    }

    const ZERO_PADDING_VALUE = 0;
    elementValues.push(ZERO_PADDING_VALUE);

    const sumPairs = generateCombinations(elementValues);
    sumPairs.sort((valA, valB) => valA - valB);

    const maxAchievedSum = findMaxSumUnderLimit(sumPairs, limitValue);

    console.log(maxAchievedSum);
}
