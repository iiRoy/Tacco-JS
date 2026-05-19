const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const dataLines = rawInputContent.split("\n");

const createDescendingNumericComparator = (valueA, valueB) => {
    const numericA = parseFloat(valueA);
    const numericB = parseFloat(valueB);
    return numericB - numericA;
};

dataLines.sort(createDescendingNumericComparator);

const highestValueAsString = dataLines[0];
const lowestValueAsString = dataLines[dataLines.length - 1];

const highestNumericValue = parseFloat(highestValueAsString);
const lowestNumericValue = parseFloat(lowestValueAsString);

const scaledHighest = highestNumericValue * 10;
const scaledLowest = lowestNumericValue * 10;

const scaledDifference = scaledHighest - scaledLowest;
const finalCalculatedResult = scaledDifference / 10;

console.log(finalCalculatedResult);
