"use strict"
const fileSystemModule = require('fs');
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";
const delimiterChar = " ";

function getProcessedValue(originalValue) {
    if (originalValue > 1) {
        return originalValue;
    } else {
        return 0;
    }
}

const rawData = fileSystemModule.readFileSync(standardInputPath, encodingType);
const inputStringContent = rawData.toString();
const inputParts = inputStringContent.split(delimiterChar);

const firstRawValue = parseInt(inputParts[0]);
const processedFirstVal = getProcessedValue(firstRawValue);

const secondRawValue = parseInt(inputParts[1]);
const processedSecondVal = getProcessedValue(secondRawValue);

const finalProduct = processedFirstVal * processedSecondVal;
console.log(finalProduct);
