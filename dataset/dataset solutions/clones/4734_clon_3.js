'use strict';

function determineCharacterSpan(sourceText, startIdentifier, endIdentifier) {
    const firstOccurrenceIndex = sourceText.indexOf(startIdentifier);
    let lastOccurrenceIndex = sourceText.lastIndexOf(endIdentifier);

    let effectiveEndBoundary;
    if (lastOccurrenceIndex === -1) {
        effectiveEndBoundary = sourceText.length + 1;
    } else {
        effectiveEndBoundary = lastOccurrenceIndex + 1;
    }

    return effectiveEndBoundary - firstOccurrenceIndex;
}

const executeCalculation = (fullInputContent) => {
    const primaryLine = fullInputContent.split('\n')[0];

    const START_MARKER_CHAR = 'A';
    const END_MARKER_CHAR = 'Z';

    const computedSpan = determineCharacterSpan(primaryLine, START_MARKER_CHAR, END_MARKER_CHAR);

    console.log(computedSpan);
};

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const fileContentBuffer = fileSystemModule.readFileSync(standardInputPath, 'utf-8');

executeCalculation(fileContentBuffer);
