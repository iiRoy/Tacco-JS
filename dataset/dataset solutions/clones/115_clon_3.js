const fileSystem = require('fs');
const inputFilePath = '/dev/stdin';

const rawInputContent = fileSystem.readFileSync(inputFilePath, 'utf8');
const trimmedAndSplitInput = rawInputContent.trim().split(/\s/);

const sortedNumbers = trimmedAndSplitInput.sort((firstNum, secondNum) => firstNum - secondNum);

const calculateSubarrayFrequency = (sourceArray, startingIndex) => {
    let elementCount = 1;
    const targetElement = sourceArray[startingIndex];
    for (let checkIndex = startingIndex + 1; checkIndex < sourceArray.length; checkIndex++) {
        if (sourceArray[checkIndex] === targetElement) {
            elementCount++;
        }
    }
    return elementCount;
};

let frequencyCounts = [];
const totalElements = sortedNumbers.length;

for (let outerIterationIndex = 0; outerIterationIndex < totalElements; outerIterationIndex++) {
    const currentElementFrequency = calculateSubarrayFrequency(sortedNumbers, outerIterationIndex);
    frequencyCounts.push(currentElementFrequency);
}

const findMaximumInArray = (numericArray) => Math.max.apply(null, numericArray);

const initialMaxFrequency = findMaximumInArray(frequencyCounts);
let outputIndexOffset = 1;

while (initialMaxFrequency === findMaximumInArray(frequencyCounts)) {
    const currentHighestFrequencyInLoop = findMaximumInArray(frequencyCounts);
    const indexOfHighestFrequency = frequencyCounts.indexOf(currentHighestFrequencyInLoop);

    const valueToPrint = sortedNumbers[indexOfHighestFrequency + outputIndexOffset];
    console.log(valueToPrint);

    outputIndexOffset++;
    frequencyCounts.splice(indexOfHighestFrequency, 1);
}
