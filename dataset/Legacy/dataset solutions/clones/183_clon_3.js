var fileSystem = require('fs');

// Helper function to convert a string to a number
const convertStringToNumber = (numericString) => {
    return Number(numericString);
};

// Helper function to parse a single line into a pair of numbers
const processInputLine = (currentLine) => {
    const stringParts = currentLine.split(',');
    const firstValue = convertStringToNumber(stringParts[0]);
    const secondValue = convertStringToNumber(stringParts[1]);
    return [firstValue, secondValue];
};

// Read raw input data from standard input
var rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process raw data into an array of lines, trimming whitespace
var dataLines = rawData.trim().split('\n');
 
// Parse each line into an array of numbers
var parsedNumbers = dataLines.map(processInputLine);

// Initialize an object to hold both accumulated sums
const initialAccumulators = {
    totalProductSum: 0,
    totalQuantitySum: 0
};

// Reduce the array of number pairs to calculate both sums in a single pass
const finalAccumulatedValues = parsedNumbers.reduce((acc, currentPair) => {
    const firstElement = currentPair[0];
    const secondElement = currentPair[1];
    const productOfPair = firstElement * secondElement;

    acc.totalProductSum += productOfPair;
    acc.totalQuantitySum += secondElement;
    return acc;
}, initialAccumulators);

// Extract the calculated sums
var overallProductSum = finalAccumulatedValues.totalProductSum;
var overallQuantitySum = finalAccumulatedValues.totalQuantitySum;

// Calculate the average of the second elements, rounded to the nearest integer
var averageQuantity = Math.round(overallQuantitySum / parsedNumbers.length);

// Output the results
console.log(overallProductSum, averageQuantity);
