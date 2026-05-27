const fileSystemAccess = require('fs');
const rawInputBuffer = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputBuffer.split('\n');

const extractInteger = (lineIndex, sourceArray) => {
    const stringRepresentation = sourceArray[lineIndex];
    return parseInt(stringRepresentation, 10);
};

const firstNumericValue = extractInteger(0, inputLinesArray);
const secondNumericValue = extractInteger(1, inputLinesArray);

const squaredFirstValue = firstNumericValue * firstNumericValue;
const computedDifference = squaredFirstValue - secondNumericValue;

console.log(computedDifference);
