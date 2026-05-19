"use strict";

function retrieveAndParseInput() {
    const fileSystemModule = require('fs');
    const rawContentString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const contentSegments = rawContentString.split(" ");
    return { firstSegment: contentSegments[0], secondSegment: contentSegments[1] };
}

const inputData = retrieveAndParseInput();
const primaryValue = inputData.firstSegment;
const secondaryValue = inputData.secondSegment;

let comparisonOutcomeMessage;

if (primaryValue === secondaryValue) {
    comparisonOutcomeMessage = 'a == b';
} else {
    const isPrimaryValueGreater = primaryValue > secondaryValue;
    if (isPrimaryValueGreater) {
        comparisonOutcomeMessage = 'a > b';
    } else {
        comparisonOutcomeMessage = 'a < b';
    }
}

console.log(comparisonOutcomeMessage);
