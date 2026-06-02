function performCountingSort(sourceArray, destinationArray, maxValue) {
    const countBuffer = new Array(maxValue + 1).fill(0);

    const sourceLength = sourceArray.length;

    for (let elementIndex = 0; elementIndex <= sourceLength; elementIndex++) {
        const currentElement = sourceArray[elementIndex];
        countBuffer[currentElement]++;
    }

    for (let cumulativeIndex = 1; cumulativeIndex <= maxValue; cumulativeIndex++) {
        countBuffer[cumulativeIndex] += countBuffer[cumulativeIndex - 1];
    }

    for (let elementIndex = sourceLength - 1; elementIndex >= 0; elementIndex--) {
        const valueToPlace = sourceArray[elementIndex];
        const targetPositionInDestination = countBuffer[valueToPlace] - 1;
        destinationArray[targetPositionInDestination] = valueToPlace;
        countBuffer[valueToPlace] = countBuffer[valueToPlace] - 1;
    }
}

const STDIN_FILE_PATH = '/dev/stdin';
const ENCODING_UTF8 = 'utf8';
const MAX_SORT_VALUE = 10000;
const SPACE_DELIMITER = ' ';

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync(STDIN_FILE_PATH, ENCODING_UTF8);

let inputLines = rawInputData.split('\n');

const arraySizeLine = inputLines.shift();
let arraySize = Number(arraySizeLine);

const arrayAString = inputLines.shift();
const stringElementsA = arrayAString.split(SPACE_DELIMITER);
let sourceArray = stringElementsA.map(elementString => Number(elementString));

let destinationArray = [];

performCountingSort(sourceArray, destinationArray, MAX_SORT_VALUE);

console.log(destinationArray.join(SPACE_DELIMITER));
