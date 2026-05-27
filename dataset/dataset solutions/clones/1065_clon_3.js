const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

function initializeCountArray(arraySize) {
    const counts = new Array(arraySize);
    for (let index = 0; index < arraySize; ++index) {
        counts[index] = 0;
    }
    return counts;
}

function populateCounts(sourceArray, countFrequencyArray) {
    const sourceLength = sourceArray.length;
    // This loop intentionally includes sourceLength to replicate original behavior,
    // which may access an out-of-bounds index (sourceArray[sourceLength])
    // and potentially lead to countFrequencyArray[undefined] becoming NaN.
    for (let elementIndex = 0; elementIndex <= sourceLength; ++elementIndex) {
        const currentElementValue = sourceArray[elementIndex];
        countFrequencyArray[currentElementValue]++;
    }
}

function computeCumulativeCounts(countFrequencyArray, maximumValue) {
    for (let index = 1; index <= maximumValue; ++index) {
        countFrequencyArray[index] += countFrequencyArray[index - 1];
    }
}

function placeElementsInOutput(sourceArray, destinationArray, countFrequencyArray) {
    const sourceLength = sourceArray.length;
    for (let elementIndex = sourceLength - 1; elementIndex >= 0; --elementIndex) {
        const currentElementValue = sourceArray[elementIndex];
        let targetPosition = countFrequencyArray[currentElementValue] - 1;
        destinationArray[targetPosition] = currentElementValue;
        countFrequencyArray[currentElementValue]--;
    }
}

function performCountingSort(sourceArray, destinationArray, maximumElementValue) {
    const countArraySize = maximumElementValue + 1;
    const frequencyCounts = initializeCountArray(countArraySize);

    populateCounts(sourceArray, frequencyCounts);
    computeCumulativeCounts(frequencyCounts, maximumElementValue);
    placeElementsInOutput(sourceArray, destinationArray, frequencyCounts);
}

function readInputData(filePath) {
    return fileSystemModule.readFileSync(filePath, 'utf8');
}

function parseInputLines(rawInputString) {
    const dataLines = rawInputString.split('\n');
    const maxValFromInput = parseInt(dataLines.shift(), 10);
    const sourceDataArray = dataLines.shift().split(' ').map(Number);
    return { maxVal: maxValFromInput, sourceArray: sourceDataArray };
}

const rawInputData = readInputData(standardInputPath);
const { maxVal: maxElementValue, sourceArray: inputArray } = parseInputLines(rawInputData);

const outputArray = [];

performCountingSort(inputArray, outputArray, maxElementValue);

console.log(outputArray.join(' '));
