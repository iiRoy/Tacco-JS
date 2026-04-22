'use strict'

function processNumericSequence(inputStringPayload) {
    const parsedIntegers = inputStringPayload.match(/(-?\d+)/g).map(val => parseInt(val, 10));
    
    const extentParameter = parsedIntegers[0];
    const focalPoint = parsedIntegers[1];

    const sequenceBeginning = focalPoint - extentParameter + 1;
    const totalElementCount = (2 * extentParameter) - 1;

    const resultingCollection = Array.from({ length: totalElementCount }, (_, offset) => {
        return sequenceBeginning + offset;
    });

    return resultingCollection.join(' ');
}

const fileContents = require('node:fs').readFileSync('/dev/stdin', 'utf8');

console.log(processNumericSequence(fileContents));