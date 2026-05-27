function findKeyPosition(sortedArray, targetValue) {
    let startIndex = 0;
    let endIndex = sortedArray.length;
    let iterationCount = 0;

    while (startIndex < endIndex) {
        iterationCount++;
        const rawMidpoint = (startIndex + endIndex) / 2;
        const middleIndex = Math.floor(rawMidpoint);

        if (sortedArray[middleIndex] === targetValue) {
            return iterationCount;
        }

        if (targetValue < sortedArray[middleIndex]) {
            endIndex = middleIndex;
        } else {
            startIndex = middleIndex + 1;
        }
    }
    return iterationCount;
}

const getNextNumericLine = (linesArray) => {
    const shiftedValue = linesArray.shift();
    return Number(shiftedValue);
};

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

while (true) {
    const arraySize = getNextNumericLine(inputLines);
    if (arraySize === 0) {
        break;
    }

    const currentArray = [];
    let currentElementIndex = 0;
    while (currentElementIndex < arraySize) {
        currentArray.push(getNextNumericLine(inputLines));
        currentElementIndex++;
    }

    const targetValueForSearch = getNextNumericLine(inputLines);

    console.log(findKeyPosition(currentArray, targetValueForSearch));
}
