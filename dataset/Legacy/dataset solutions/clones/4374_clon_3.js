'use strict';

const extractAndParseNumericValues = (lineString) => {
    const stringComponents = lineString.split(' ');
    const firstNumericValue = parseInt(stringComponents[0], 10);
    const secondNumericValue = parseInt(stringComponents[1], 10);
    return { firstNumericValue, secondNumericValue };
};

const processInputData = (rawInputContent) => {
    const contentLines = rawInputContent.split('\n');
    const primaryDataLine = contentLines[0];

    const { firstNumericValue: initialQuantity, secondNumericValue: deductionAmount } = extractAndParseNumericValues(primaryDataLine);

    const computedDifference = initialQuantity - deductionAmount;
    const finalOutputValue = Math.max(0, computedDifference);

    console.log(finalOutputValue);
};

const fileSystemUtility = require('fs');
const standardInputFile = '/dev/stdin';
const textEncoding = 'utf8';

const fileContentBuffer = fileSystemUtility.readFileSync(standardInputFile, textEncoding);
processInputData(fileContentBuffer);
