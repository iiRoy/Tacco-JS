const appSettings = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

const fileSystemModule = require('fs');

const readAndSplitInput = (path, delimiter) => {
    const fileContent = fileSystemModule.readFileSync(path, 'utf-8');
    return fileContent.split(delimiter);
};

const parseNumericArrayFromString = (inputString) => {
    return inputString.split(' ').map(item => parseInt(item, 10));
};

const displayArrayElements = (arrayToDisplay) => {
    console.log(arrayToDisplay.map(element => String(element)).join(' '));
};

const performElementSwap = (arrayRef, indexA, indexB) => {
    const temporaryValue = arrayRef[indexA];
    arrayRef[indexA] = arrayRef[indexB];
    arrayRef[indexB] = temporaryValue;
};

const sortArrayAndCountSwaps = (targetArray) => {
    let swapOperationsCount = 0;
    const currentArrayLength = targetArray.length;

    for (let outerLoopIndex = 0; outerLoopIndex < currentArrayLength; outerLoopIndex++) {
        let minimumElementIndex = outerLoopIndex;

        for (let innerLoopIndex = outerLoopIndex + 1; innerLoopIndex < currentArrayLength; innerLoopIndex++) {
            if (targetArray[innerLoopIndex] < targetArray[minimumElementIndex]) {
                minimumElementIndex = innerLoopIndex;
            }
        }

        if (outerLoopIndex !== minimumElementIndex) {
            performElementSwap(targetArray, outerLoopIndex, minimumElementIndex);
            swapOperationsCount++;
        }
    }

    displayArrayElements(targetArray);

    return swapOperationsCount;
};

const allInputLines = readAndSplitInput(appSettings.sourcePath, appSettings.lineDelimiter);
const dataLine = allInputLines[1];
const numbersToSort = parseNumericArrayFromString(dataLine);

console.log(sortArrayAndCountSwaps(numbersToSort));
