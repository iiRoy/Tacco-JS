const STD_INPUT_PATH = '/dev/stdin';
const LINE_BREAK_CHAR = '\n';

const getProcessedInputLines = (filePath, separator) => {
    const fileContentBuffer = require('fs').readFileSync(filePath, 'utf-8');
    return fileContentBuffer.split(separator);
};

let swapCounter = 0;

const parseNumericArrayFromString = (inputString) => {
    const stringElements = inputString.split(' ');
    return stringElements.map(strNum => parseInt(strNum, 10));
};

const bubbleUpElement = (currentElement, remainingElements) => {
    if (remainingElements.length === 0) {
        return [currentElement];
    }

    const firstElementInList = remainingElements[0];
    const restOfList = remainingElements.slice(1);

    const isCurrentSmaller = currentElement < firstElementInList;

    let processedTailResult;

    if (isCurrentSmaller) {
        processedTailResult = bubbleUpElement(firstElementInList, restOfList);
        return [currentElement].concat(processedTailResult);
    } else {
        swapCounter++;
        processedTailResult = bubbleUpElement(currentElement, restOfList);
        return [firstElementInList].concat(processedTailResult);
    }
};

const recursiveBubbleSort = (inputArray) => {
    if (inputArray.length <= 1) {
        return inputArray;
    }

    const initialElement = inputArray[0];
    const subsequentElements = inputArray.slice(1);

    const partiallySortedSubArray = recursiveBubbleSort(subsequentElements);

    return bubbleUpElement(initialElement, partiallySortedSubArray);
};

const allInputLines = getProcessedInputLines(STD_INPUT_PATH, LINE_BREAK_CHAR);

const numbersToProcess = parseNumericArrayFromString(allInputLines[1]);

const finalSortedArray = recursiveBubbleSort(numbersToProcess);

console.log(finalSortedArray.join(' '));
console.log(swapCounter);
