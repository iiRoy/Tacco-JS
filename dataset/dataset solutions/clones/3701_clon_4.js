'use strict';

function processInputData(inputLines) {
    const elementCount = parseInt(inputLines[0], 10);
    const sourceArray = inputLines[1].split(' ').map(Number);

    const derivedSequence = sourceArray.map((value, index) => value - index + 1);

    derivedSequence.sort((a, b) => a - b);

    const medianPosition = Math.floor(elementCount / 2);

    const centralValue = (elementCount & 1)
        ? derivedSequence[medianPosition]
        : ((derivedSequence[medianPosition] + derivedSequence[medianPosition - 1]) / 2) | 0;

    const totalAbsoluteDifference = derivedSequence.reduce((currentSum, currentElement) =>
        currentSum + Math.abs(currentElement - centralValue), 0);

    console.log(totalAbsoluteDifference);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'));
