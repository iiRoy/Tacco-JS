"use strict";

const fileSystemModule = require('fs');

const rawInputString = fileSystemModule.readFileSync('/dev/stdin', 'UTF-8');

const inputDataLines = rawInputString.split('\n');

const firstLineTokens = inputDataLines[0].split(' ');
const pElementStrings = inputDataLines[1].split(' ');

const valueN = parseInt(firstLineTokens[0], 10);
const valueK = parseInt(firstLineTokens[1], 10);

const foundPermutations = {};
const pElementsCount = pElementStrings.length;

for (let segmentStartIndex = 0; segmentStartIndex <= pElementsCount - valueK; segmentStartIndex++) {
    const segmentEndIndex = segmentStartIndex + valueK;

    const leadingElements = pElementStrings.slice(0, segmentStartIndex);
    const sortedMiddleSegment = pElementStrings.slice(segmentStartIndex, segmentEndIndex).sort((elemA, elemB) => (elemA > elemB ? 1 : 0));
    const trailingElements = pElementStrings.slice(segmentEndIndex);

    const currentCombinedPermutation = [...leadingElements, ...sortedMiddleSegment, ...trailingElements];

    foundPermutations[currentCombinedPermutation.join(',')] = true;
}

console.log(Object.keys(foundPermutations).length);
