const fileSystem = require('fs');

const readInputFileContent = (filePath) => {
    return fileSystem.readFileSync(filePath, 'utf-8');
};

const determineMaxValue = (inputArray) => {
    if (inputArray.length === 0) {
        return -1; // Or throw an error, but for counting sort, usually non-empty positive integers.
                   // Returning -1 is a safe sentinel if the array is empty, though the problem context implies non-empty.
    }
    let currentMaximum = inputArray[0]; // Initialize with the first element
    for (let index = 1; index < inputArray.length; index++) {
        const elementValue = inputArray[index];
        if (elementValue > currentMaximum) {
            currentMaximum = elementValue;
        }
    }
    return currentMaximum;
};

const performCountingSort = (sourceArray) => {
    const arrayLength = sourceArray.length;

    if (arrayLength === 0) {
        return [];
    }

    const maximumValue = determineMaxValue(sourceArray);
    
    // Initialize frequency counts array
    const frequencyCounts = new Array(maximumValue + 1).fill(0);

    // Count occurrences of each element
    for (let index = 0; index < arrayLength; index++) {
        const currentElement = sourceArray[index];
        frequencyCounts[currentElement]++;
    }

    // Calculate cumulative frequencies
    for (let index = 1; index <= maximumValue; index++) {
        frequencyCounts[index] += frequencyCounts[index - 1];
    }
    
    // Create the sorted output array
    const sortedElements = new Array(arrayLength);

    // Place elements into their sorted positions
    // Iterate backwards to ensure stability for equal elements
    for (let index = arrayLength - 1; index >= 0; index--) {
        const elementToPlace = sourceArray[index];
        const targetPosition = frequencyCounts[elementToPlace] - 1;
        sortedElements[targetPosition] = elementToPlace;
        frequencyCounts[elementToPlace]--; // Decrement count for the next identical element
    }

    return sortedElements;
};

const inputContentLines = readInputFileContent('/dev/stdin').split('\n');

const rawNumberString = inputContentLines[1];
const stringNumbers = rawNumberString.split(' ');
const inputNumbers = stringNumbers.map(Number);

const finalSortedResult = performCountingSort(inputNumbers);
console.log(finalSortedResult.join(' '));
