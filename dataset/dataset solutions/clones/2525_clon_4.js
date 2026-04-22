'use strict';
const processData = (sourceTextLines) => {
    const desiredCount = Number(sourceTextLines[0]);
    const numericSequenceTxt = sourceTextLines[1].split(' ');

    const valueIndexPairs = numericSequenceTxt.map((elementTxt, initialPosition) => ({
        itemValue: Number(elementTxt),
        initialPosition: initialPosition
    }));

    valueIndexPairs.sort((first, second) => {
        if (first.itemValue !== second.itemValue) {
            return first.itemValue - second.itemValue;
        }
        return first.initialPosition - second.initialPosition;
    });

    for (let loopCounter = 0; loopCounter < desiredCount; ++loopCounter) {
        console.info(valueIndexPairs[loopCounter].initialPosition + 1);
    }
};

const filesystemModule = require('node:fs');
const readFileContents = filesystemModule.readFileSync;
const rawFileContent = readFileContents('/dev/stdin', 'utf8');
const linesFromInput = rawFileContent.split('\n');

processData(linesFromInput);