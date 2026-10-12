'use strict';

const modifyStringAtIndex = (originalStringValue, oneBasedIndex) => {
    const zeroBasedPosition = oneBasedIndex - 1;

    const segmentBefore = originalStringValue.slice(0, zeroBasedPosition);
    const characterToProcess = originalStringValue.slice(zeroBasedPosition, oneBasedIndex);
    const segmentAfter = originalStringValue.slice(oneBasedIndex);

    const processedCharacter = characterToProcess.toLowerCase();

    const finalModifiedString = segmentBefore + processedCharacter + segmentAfter;
    return finalModifiedString;
};

const processInputData = (rawInputContent) => {
    const trimmedContent = rawInputContent.trim();
    const contentLines = trimmedContent.split('\n');

    const firstLine = contentLines[0];
    const secondLine = contentLines[1];

    const firstLineParts = firstLine.split(' ');
    const kValueString = firstLineParts[1];
    const targetK = Number.parseInt(kValueString, 10);

    const sourceString = secondLine;

    const resultString = modifyStringAtIndex(sourceString, targetK);
    console.log(resultString);
};

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const inputFromFile = fileSystemModule.readFileSync(standardInputPath, encodingType);
processInputData(inputFromFile);
