"use strict";

const processInformation = (sourceData) => {
    const dataParts = sourceData.trim().split(/\s+/);
    const firstRelevantPart = dataParts[0];

    let numericRepresentation = Number(firstRelevantPart);

    if (Number.isNaN(numericRepresentation)) {
        return "NaN";
    }

    const calculatedOutcome = (numericRepresentation + 1) >>> 1;

    return calculatedOutcome.toString();
};

const filesystemAccessor = require('fs');
const standardInputLocation = '/dev/stdin';
const textContentEncoding = 'utf8';

const rawContentBuffer = filesystemAccessor.readFileSync(standardInputLocation, textContentEncoding);
console.log(processInformation(rawContentBuffer));