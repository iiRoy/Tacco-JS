const RADIX_DECIMAL = 10;

function parseNumericValue(valueString, radix) {
    return parseInt(valueString, radix);
}

function determineMaximumOfThree(valA, valB, valC) {
    return Math.max(valA, valB, valC);
}

function processInputData(rawDataContent) {
    const stringComponents = rawDataContent.split(' ');

    const numberOne = parseNumericValue(stringComponents[0], RADIX_DECIMAL);
    const numberTwo = parseNumericValue(stringComponents[1], RADIX_DECIMAL);

    const sumResult = numberOne + numberTwo;
    const differenceResult = numberOne - numberTwo;
    const productResult = numberOne * numberTwo;

    let finalCalculatedMax = determineMaximumOfThree(sumResult, differenceResult, productResult);

    // Normalize negative zero to positive zero for consistent output
    if (Object.is(finalCalculatedMax, -0)) {
        finalCalculatedMax = 0;
    }

    console.log(finalCalculatedMax);
}

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileEncoding = 'utf8';

const inputString = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);
processInputData(inputString);
