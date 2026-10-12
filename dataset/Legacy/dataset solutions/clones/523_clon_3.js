const fileSystem = require('fs');
const inputFilePath = '/dev/stdin';
const rawInputString = fileSystem.readFileSync(inputFilePath, 'utf8');

const processedLines = rawInputString.trim().split('\n');

const initialConfigLine = processedLines.shift();
const configValues = initialConfigLine.split(' ').map(Number);

const numDataPoints = configValues[0];
const lengthLimit = configValues[2];

const dataEntries = [];
for (let dataIdx = 0; dataIdx < numDataPoints; dataIdx++) {
    dataEntries.push([0, 0, dataIdx]);
}

let currentMaxEntry = [0, 0]; // [index, value]
let accumulatedTime = 0;

const finalEventParts = [1, lengthLimit, 0];
const finalEventString = finalEventParts.join(' ');
processedLines.push(finalEventString);

const recalculateMax = (entries) => {
    let highestValueFound = 0;
    let highestIndexFound = 0;
    for (let k = 0; k < entries.length; k++) {
        if (entries[k][0] > highestValueFound) {
            highestValueFound = entries[k][0];
            highestIndexFound = k;
        }
    }
    return [highestIndexFound, highestValueFound];
};

for (let eventIndex = 0; eventIndex < processedLines.length; eventIndex++) {
    const currentEventLine = processedLines[eventIndex];
    const eventDetails = currentEventLine.split(' ').map(Number);

    const targetDataIndex = eventDetails[0] - 1;
    const eventTimestamp = eventDetails[1];
    const valueModifier = eventDetails[2];

    const timeDifference = eventTimestamp - accumulatedTime;
    dataEntries[currentMaxEntry[0]][1] += timeDifference;
    accumulatedTime = eventTimestamp;

    dataEntries[targetDataIndex][0] += valueModifier;

    if (valueModifier > 0) {
        const currentDataValue = dataEntries[targetDataIndex][0];
        const currentMaxVal = currentMaxEntry[1];
        const currentMaxIdx = currentMaxEntry[0];

        if (currentDataValue > currentMaxVal) {
            currentMaxEntry = [targetDataIndex, currentDataValue];
        } else if (currentDataValue === currentMaxVal && targetDataIndex <= currentMaxIdx) {
            currentMaxEntry = [targetDataIndex, currentDataValue];
        }
    } else if (valueModifier < 0 && currentMaxEntry[0] === targetDataIndex) {
        currentMaxEntry = recalculateMax(dataEntries);
    }
}

dataEntries.sort((entryA, entryB) => {
    const timeA = entryA[1];
    const timeB = entryB[1];
    if (timeA === timeB) {
        const originalIndexA = entryA[2];
        const originalIndexB = entryB[2];
        return originalIndexA - originalIndexB;
    }
    return timeB - timeA;
});

console.log(dataEntries[0][2] + 1);
