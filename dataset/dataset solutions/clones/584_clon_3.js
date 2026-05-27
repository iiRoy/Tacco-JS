const parseLineToNumbers = (lineString) => {
    return lineString.split(" ").map(Number);
};

const readAndParseInteger = (sourceArray) => {
    return Number(sourceArray.shift());
};

const generateValidPairSums = (valuesArray, sumLimit) => {
    const generatedSums = [];
    for (let idx1 = 0; idx1 < valuesArray.length; idx1++) {
        for (let idx2 = idx1; idx2 < valuesArray.length; idx2++) {
            const currentPairSum = valuesArray[idx1] + valuesArray[idx2];
            if (currentPairSum <= sumLimit) {
                generatedSums.push(currentPairSum);
            }
        }
    }
    return generatedSums;
};

const findOptimalSum = (sortedSums, sumLimit) => {
    let currentMaxAchieved = 0;
    let rightIndex = sortedSums.length - 1;

    if (sortedSums.length === 0) {
        return 0;
    }

    for (let leftIndex = 0; leftIndex < sortedSums.length; leftIndex++) {
        const leftValue = sortedSums[leftIndex];

        while (rightIndex >= 0 && leftValue + sortedSums[rightIndex] > sumLimit) {
            rightIndex--;
        }

        if (rightIndex < 0) {
            break;
        }

        const potentialMax = leftValue + sortedSums[rightIndex];
        currentMaxAchieved = Math.max(currentMaxAchieved, potentialMax);
    }
    return currentMaxAchieved;
};

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = (rawInputData.trim()).split("\n");

while (true) {
    const currentDimensionsLine = inputLines.shift();
    const [numItems, maxSumLimit] = parseLineToNumbers(currentDimensionsLine);

    if (numItems === 0 && maxSumLimit === 0) {
        break;
    }

    const itemCollection = [];
    for (let i = 0; i < numItems; i++) {
        itemCollection.push(readAndParseInteger(inputLines));
    }
    
    const ZERO_ITEM_VALUE = 0;
    itemCollection.push(ZERO_ITEM_VALUE);

    let allPossibleSums = generateValidPairSums(itemCollection, maxSumLimit);
    
    allPossibleSums.sort((a, b) => a - b);

    const finalMaxSum = findOptimalSum(allPossibleSums, maxSumLimit);
    
    console.log(finalMaxSum);
}
