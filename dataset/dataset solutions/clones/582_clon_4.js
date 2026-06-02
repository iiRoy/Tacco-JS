const fileSystem = require('node:fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const allInputLines = rawInputContent.trim().split('\n');

function* inputBlockGenerator(linesCollection) {
    let currentLineIndex = 0;
    while (true) {
        const dimensionsLine = linesCollection[currentLineIndex++];
        const [nVal, mVal] = dimensionsLine.split(' ').map(Number);

        if (nVal === 0 && mVal === 0) {
            break;
        }

        const numberList = [];
        for (let i = 0; i < nVal; i++) {
            numberList.push(Number(linesCollection[currentLineIndex++]));
        }
        yield { nVal, mVal, numberList };
    }
}

function findLargestElementIndex(sortedArray, targetValue) {
    let lowBound = 0;
    let highBound = sortedArray.length - 1;
    let bestIndex = -1;

    while (lowBound <= highBound) {
        const midPoint = Math.floor((lowBound + highBound) / 2);
        if (sortedArray[midPoint] <= targetValue) {
            bestIndex = midPoint;
            lowBound = midPoint + 1;
        } else {
            highBound = midPoint - 1;
        }
    }
    return bestIndex;
}

for (const { nVal: currentN, mVal: currentM, numberList: initialNumbers } of inputBlockGenerator(allInputLines)) {
    const processedNumbers = [...initialNumbers, 0];

    const sumCombinations = processedNumbers.flatMap((firstVal, firstIdx) =>
        processedNumbers.slice(firstIdx).map(secondVal => firstVal + secondVal)
    );

    sumCombinations.sort((valA, valB) => valA - valB);

    let maximumPossibleSum = 0;

    for (let i = 0; i < sumCombinations.length; i++) {
        const currentSumPart = sumCombinations[i];
        const requiredComplement = currentM - currentSumPart;

        const complementIndex = findLargestElementIndex(sumCombinations, requiredComplement);

        if (complementIndex !== -1) {
            const potentialSum = currentSumPart + sumCombinations[complementIndex];
            maximumPossibleSum = Math.max(maximumPossibleSum, potentialSum);
        }
    }
    console.log(maximumPossibleSum);
}
