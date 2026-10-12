const fs = require('fs');
const fileContent = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

let currentLineIdx = 0;

const readNextNumber = () => {
    const numberAsString = inputLines[currentLineIdx];
    currentLineIdx++;
    return parseInt(numberAsString, 10);
};

const readNumberArray = (size) => {
    const temporaryArray = [];
    for (let elementIndex = 0; elementIndex < size; elementIndex++) {
        temporaryArray.push(readNextNumber());
    }
    return temporaryArray;
};

function findTargetIndexIterations(targetValue, dataCollection) {
    let lowBound = 0;
    let highBound = dataCollection.length;
    let searchIterations = 0;

    while (lowBound < highBound) {
        searchIterations++;
        const midPoint = Math.floor((lowBound + highBound) / 2);
        const currentElement = dataCollection[midPoint];

        if (currentElement === targetValue) {
            return searchIterations;
        } else if (targetValue < currentElement) {
            highBound = midPoint;
        } else {
            lowBound = midPoint + 1;
        }
    }
    return searchIterations;
}

let arrayLength;
do {
    arrayLength = readNextNumber();
    if (arrayLength === 0) {
        break;
    }

    const currentArrayData = readNumberArray(arrayLength);
    const searchKey = readNextNumber();

    const resultCount = findTargetIndexIterations(searchKey, currentArrayData);
    console.log(resultCount);

} while (true);
