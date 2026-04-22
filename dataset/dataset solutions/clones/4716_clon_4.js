'use strict';

const dataStream = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');

const matrixDimensions = dataStream[0].split(' ').map(Number);
const majorSize = matrixDimensions[0];
const minorSize = matrixDimensions[1];

const mainGridContent = dataStream.slice(1, 1 + majorSize).map(lineFragment => lineFragment.split(''));
const searchPatternContent = dataStream.slice(1 + majorSize, 1 + majorSize + minorSize).map(lineFragment => lineFragment.split(''));

const assessPlacement = (universeGrid, targetPattern, rowOrigin, colOrigin) => {
    return targetPattern.every((patternRowSegment, patternRowIndex) => {
        return patternRowSegment.every((patternCharacter, patternColIndex) => {
            return universeGrid[rowOrigin + patternRowIndex][colOrigin + patternColIndex] === patternCharacter;
        });
    });
};

const candidateRowIndices = Array.from({ length: majorSize - minorSize + 1 }, (_, idx) => idx);
const candidateColIndices = Array.from({ length: majorSize - minorSize + 1 }, (_, idx) => idx);

const occurrenceDetected = candidateRowIndices.some(startRowCandidate => {
    return candidateColIndices.some(startColCandidate => {
        return assessPlacement(mainGridContent, searchPatternContent, startRowCandidate, startColCandidate);
    });
});

if (occurrenceDetected) {
    console.log('Yes');
} else {
    console.log('No');
}