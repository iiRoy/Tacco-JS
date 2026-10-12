function normalizeValue(currentValue, upperLimit) {
    if (currentValue <= upperLimit) {
        return currentValue;
    }
    let remainder = currentValue % upperLimit;
    if (remainder === 0) {
        return upperLimit;
    }
    return remainder;
}

function processInputData(rawDataString) {
    const parsedNumbers = rawDataString.split('\n').map(Number);

    const initialFirstElement = parsedNumbers[0];
    const reductionThreshold = 500;
    const adjustedFirstElement = normalizeValue(initialFirstElement, reductionThreshold);
    parsedNumbers[0] = adjustedFirstElement;

    const firstComparisonValue = parsedNumbers[0];
    const secondComparisonValue = parsedNumbers[1];

    let finalOutputString;
    if (firstComparisonValue <= secondComparisonValue) {
        finalOutputString = 'Yes';
    } else {
        finalOutputString = 'No';
    }

    console.log(finalOutputString);
}

const fileSystemHandler = require('fs');
const standardInputPath = '/dev/stdin';
const fileReadEncoding = 'utf8';

const fileContentBuffer = fileSystemHandler.readFileSync(standardInputPath, fileReadEncoding);
processInputData(fileContentBuffer);
