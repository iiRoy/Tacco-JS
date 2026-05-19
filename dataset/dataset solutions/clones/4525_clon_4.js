'use strict';

const processInput = (sourceData) => {
    const dataLines = sourceData.split('\n');
    const targetLineContent = dataLines[1];
    const numberStrings = targetLineContent.split(' ');

    let minimumEncountered = Infinity;
    let maximumEncountered = -Infinity;

    for (let i = 0; i < numberStrings.length; i++) {
        const currentNumericValue = Number(numberStrings[i]);
        if (currentNumericValue < minimumEncountered) {
            minimumEncountered = currentNumericValue;
        }
        if (currentNumericValue > maximumEncountered) {
            maximumEncountered = currentNumericValue;
        }
    }

    console.log(maximumEncountered - minimumEncountered);
};

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));
