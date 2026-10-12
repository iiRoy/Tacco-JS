const INPUT_FILE_PATH = '/dev/stdin';
const LINE_DELIMITER = '\n';

const fileContent = require('fs').readFileSync(INPUT_FILE_PATH, 'utf-8');
const inputLines = fileContent.split(LINE_DELIMITER);

const parseDataItem = (itemString) => {
    const numericValue = parseInt(itemString[1]);
    return [numericValue, itemString];
};

const parsedData = inputLines[1].split(' ').map(parseDataItem);

const bubbleSwapPass = (elementsArray) => {
    const arrayLength = elementsArray.length;
    if (arrayLength <= 1) {
        return elementsArray;
    }

    const firstElement = elementsArray[0];
    const secondElement = elementsArray[1];
    const tailElements = elementsArray.slice(2);

    if (firstElement[0] > secondElement[0]) {
        const swappedTailResult = bubbleSwapPass([firstElement, ...tailElements]);
        return [secondElement, ...swappedTailResult];
    } else {
        const swappedTailResult = bubbleSwapPass([secondElement, ...tailElements]);
        return [firstElement, ...swappedTailResult];
    }
};

const bubbleSortRecursive = (inputArray) => {
    if (inputArray.length === 0) {
        return [];
    }
    const passResult = bubbleSwapPass(inputArray);
    const lastElement = passResult[passResult.length - 1];
    const headPart = passResult.slice(0, passResult.length - 1);
    return [...bubbleSortRecursive(headPart), lastElement];
};

const selectionSortRecursive = (inputArray) => {
    if (inputArray.length === 0) {
        return [];
    }

    const minimumElement = inputArray.reduce((accumulator, item) => accumulator[0] > item[0] ? item : accumulator);
    const remainingElements = [];
    let minimumFoundAndRemoved = false;

    for (const item of inputArray) {
        // Check for exact match to remove only the first occurrence of the minimum
        if (!minimumFoundAndRemoved && item[0] === minimumElement[0] && item[1] === minimumElement[1]) {
            minimumFoundAndRemoved = true;
        } else {
            remainingElements.push(item);
        }
    }
    return [minimumElement, ...selectionSortRecursive(remainingElements)];
};

const checkStability = (sortedArray, originalArray) => {
    return originalArray.every((item, index) => sortedArray[index][1] === item[1]);
};

const bubbleSortedResult = bubbleSortRecursive(parsedData);
const selectionSortedResult = selectionSortRecursive(parsedData);

const bubbleSortedOutput = bubbleSortedResult.map(item => item[1]).join(' ');
console.log(bubbleSortedOutput);
console.log('Stable');

const selectionSortedOutput = selectionSortedResult.map(item => item[1]).join(' ');
console.log(selectionSortedOutput);

const stabilityCheckOutcome = checkStability(bubbleSortedResult, selectionSortedResult) ? 'Stable' : 'Not stable';
console.log(stabilityCheckOutcome);
