let inputLines = [];

const inputReaderModule = require('readline');
const standardInput = process.stdin;
const standardOutput = process.stdout;

const lineInterface = inputReaderModule.createInterface({
    input: standardInput,
    output: standardOutput,
});

lineInterface.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

function parseNthNumber(sourceString, positionIndex) {
    const parts = sourceString.split(" ");
    return Number(parts[positionIndex]);
}

function getAndIncrementCount(countsMap, key) {
    const currentCount = countsMap[key] || 0;
    countsMap[key] = currentCount + 1;
    return currentCount;
}

lineInterface.on('close', function () {
    const firstInputLine = inputLines[0];
    const arraySize = parseNthNumber(firstInputLine, 0);
    const moduloValue = parseNthNumber(firstInputLine, 1);

    const inputArray = inputLines[1].split(" ").map(Number);

    const prefixSumsModM = [0];
    for (let idx = 0; idx < arraySize; idx++) {
        const previousSum = prefixSumsModM[idx];
        const currentElement = inputArray[idx];
        prefixSumsModM.push((previousSum + currentElement) % moduloValue);
    }

    let totalPairs = 0;
    const remainderCounts = {};

    for (let idx = 0; idx < prefixSumsModM.length; idx++) {
        const currentRemainder = prefixSumsModM[idx];
        totalPairs += getAndIncrementCount(remainderCounts, currentRemainder);
    }

    console.log(totalPairs);
});
