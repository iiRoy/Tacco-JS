const fileSystemInterface = require('node:fs');

const parseIntegerFromString = (inputString) => Number(inputString);

const rawDataBuffer = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawDataBuffer.trim().split("\n");

const primaryArraySize = parseIntegerFromString(processedLines.shift());

const initialNumberSequence = processedLines.shift().split(" ").map(parseIntegerFromString);

const targetSortedSequence = [...initialNumberSequence].sort((valA, valB) => valA - valB);

const totalSwapOperations = parseIntegerFromString(processedLines.shift());

const swapInstructions = processedLines.map(line =>
    line.split(" ").map(parseIntegerFromString).map(index => index - 1)
);

const currentDeviationSnapshot = {};
const baselineSortedSnapshot = {};

for (let elementIndex = 0; elementIndex < primaryArraySize; ++elementIndex) {
    if (initialNumberSequence[elementIndex] !== targetSortedSequence[elementIndex]) {
        currentDeviationSnapshot[elementIndex] = initialNumberSequence[elementIndex];
        baselineSortedSnapshot[elementIndex] = targetSortedSequence[elementIndex];
    }
}

const initialDiscrepancyCount = Object.keys(baselineSortedSnapshot).length;

let targetDiscrepancyString = "";
for (const key of Object.keys(baselineSortedSnapshot).sort((k1, k2) => Number(k1) - Number(k2))) {
    targetDiscrepancyString += baselineSortedSnapshot[key];
}

let isSortedConfigurationFound = false;
let foundAtIndex = -1;

if (initialDiscrepancyCount === 0) {
    console.log(0);
    return;
}

const generateCurrentDiscrepancyString = (snapshot) => {
    let currentString = "";
    for (const key of Object.keys(snapshot).sort((k1, k2) => Number(k1) - Number(k2))) {
        currentString += snapshot[key];
    }
    return currentString;
};

if (generateCurrentDiscrepancyString(currentDeviationSnapshot) === targetDiscrepancyString) {
    isSortedConfigurationFound = true;
    foundAtIndex = 0;
}

for (let queryIteration = 0; queryIteration < totalSwapOperations; ++queryIteration) {
    if (isSortedConfigurationFound) {
        break;
    }

    const currentSwapPair = swapInstructions[queryIteration];
    const indexOne = currentSwapPair[0];
    const indexTwo = currentSwapPair[1];

    const valueAtFirstIndex = currentDeviationSnapshot[indexOne];
    const valueAtSecondIndex = currentDeviationSnapshot[indexTwo];

    currentDeviationSnapshot[indexOne] = valueAtSecondIndex;
    currentDeviationSnapshot[indexTwo] = valueAtFirstIndex;

    const currentDiscrepancyString = generateCurrentDiscrepancyString(currentDeviationSnapshot);

    if (currentDiscrepancyString === targetDiscrepancyString) {
        isSortedConfigurationFound = true;
        foundAtIndex = queryIteration + 1;
        break;
    }
}

if (isSortedConfigurationFound) {
    console.log(foundAtIndex);
} else {
    console.log(-1);
}