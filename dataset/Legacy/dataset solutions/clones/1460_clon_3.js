const fileSystemModule = require('fs');

const numericAscendingComparator = (firstValue, secondValue) => {
    return firstValue - secondValue;
};

const parseSpaceSeparatedNumbers = (inputLineContent) => {
    const stringTokens = inputLineContent.split(' ');
    const convertedNumbers = stringTokens.map(tokenString => Number(tokenString));
    return convertedNumbers;
};

var rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
var processedInputLines = rawInputContent.split('\n');

var firstLineData = processedInputLines.shift();
var totalElementsCount = Number(firstLineData);

var numbersLineString = processedInputLines.shift();
var collectionOfNumbers = parseSpaceSeparatedNumbers(numbersLineString);

collectionOfNumbers.sort(numericAscendingComparator);

console.log(collectionOfNumbers.join(' '));
