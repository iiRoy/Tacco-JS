'use strict';

const processData = (rawDataPayload) => {
    const [initialConfigLine, valueSequenceLine] = rawDataPayload.split('\n');

    const [, selectionCount] = initialConfigLine.split(' ').map(Number);

    const numericalElements = valueSequenceLine.split(' ').map(Number);

    const finalTally = numericalElements
        .sort((elementA, elementB) => elementB - elementA)
        .slice(0, selectionCount)
        .reduce((currentSum, currentElement) => currentSum + currentElement, 0);

    console.log(finalTally);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
