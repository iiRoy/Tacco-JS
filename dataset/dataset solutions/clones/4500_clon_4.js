"use strict";

const processInputData = (rawText) => {
    const lines = rawText.trim().split('\n');
    const countVal = Number(lines[0]);
    const numberSequence = lines[1].split(' ').map(Number);
    return { count: countVal, sequence: numberSequence };
};

const reorderSequence = (dataObj) => {
    const totalCount = dataObj.count;
    const sourceSequence = dataObj.sequence;

    const allPositions = Array.from({ length: totalCount }, (_, pos) => pos);

    const lastPositionParity = (totalCount - 1) % 2;

    const primaryPositions = allPositions.filter(pos => pos % 2 === lastPositionParity);
    const secondaryPositions = allPositions.filter(pos => pos % 2 !== lastPositionParity);

    const firstSegment = primaryPositions.reverse().map(pos => sourceSequence[pos]);
    const secondSegment = secondaryPositions.map(pos => sourceSequence[pos]);

    return firstSegment.concat(secondSegment);
};

const displayResult = (finalSequence) => {
    console.log(finalSequence.join(' '));
};

const initiateTransformation = (inputPayload) => {
    const parsedData = processInputData(inputPayload);
    const transformedData = reorderSequence(parsedData);
    displayResult(transformedData);
};

initiateTransformation(require('fs').readFileSync('/dev/stdin', 'utf8'));