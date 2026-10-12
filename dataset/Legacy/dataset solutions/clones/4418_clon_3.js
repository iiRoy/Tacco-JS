"use strict";

const RADIX_BASE = 10;

const parseNumericValue = (valueString) => {
    return parseInt(valueString, RADIX_BASE);
};

const processInputData = (rawData) => {
    const trimmedInput = rawData.trim();
    const stringValueArray = trimmedInput.split(' ');
    const numericValues = stringValueArray.map(parseNumericValue);

    const intervalOneStart = numericValues[0];
    const intervalOneEnd = numericValues[1];
    const intervalTwoStart = numericValues[2];
    const intervalTwoEnd = numericValues[3];

    const effectiveStart = Math.max(intervalOneStart, intervalTwoStart);
    const effectiveEnd = Math.min(intervalOneEnd, intervalTwoEnd);

    const potentialLength = effectiveEnd - effectiveStart;
    const finalResult = Math.max(0, potentialLength);

    console.log(finalResult);
};

const fileSystemUtility = require('fs');
const standardInputFile = '/dev/stdin';
const utf8Encoding = 'utf8';

const inputContent = fileSystemUtility.readFileSync(standardInputFile, utf8Encoding);
processInputData(inputContent);
