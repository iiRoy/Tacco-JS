'use strict'

function removeOuterWhitespace(textSegment) {
    let startPosition = 0;
    let endPosition = textSegment.length - 1;

    while (startPosition <= endPosition && (textSegment.charCodeAt(startPosition) <= 32)) {
        startPosition++;
    }
    while (endPosition >= startPosition && (textSegment.charCodeAt(endPosition) <= 32)) {
        endPosition--;
    }

    if (startPosition > endPosition) {
        return "";
    }
    return textSegment.substring(startPosition, endPosition + 1);
}

function displayOutcome(calculatedValue) {
    process.stdout.write(String(calculatedValue) + '\n');
}

function processNumericalData(rawInputText) {
    const lineBreakIndex = rawInputText.indexOf('\n');
    const firstTextLine = rawInputText.substring(0, lineBreakIndex); // This line is not used in computation
    const dataTextLine = rawInputText.substring(lineBreakIndex + 1);

    const stringRepresentations = dataTextLine.match(/\-?\d+/g);
    const numericalEntities = stringRepresentations.map(entry => parseInt(entry, 10));

    const orderedSet = numericalEntities.sort((elementA, elementB) => elementA - elementB);

    const smallestEntry = orderedSet[0];
    const largestEntry = orderedSet[orderedSet.length - 1];

    const resultantDifference = largestEntry - smallestEntry;

    displayOutcome(resultantDifference);
}

const fileSystemAccessor = require("node:fs");
const retrievedContent = fileSystemAccessor.readFileSync("/dev/stdin", "utf8");

const cleanedContent = removeOuterWhitespace(retrievedContent);
processNumericalData(cleanedContent);