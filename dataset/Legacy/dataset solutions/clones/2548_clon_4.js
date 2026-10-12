"use strict";

const inputData = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const lines = inputData.split('\n');
const firstLineParts = lines[0].split(' ');
const elementStrings = lines[1].split(' ');

const totalElementsCount = parseInt(firstLineParts[0]);
const windowSegmentSize = parseInt(firstLineParts[1]);

const distinctArrangements = new Set();

for (let currentWindowStart = 0; currentWindowStart <= elementStrings.length - windowSegmentSize; ++currentWindowStart) {
    const currentArrayState = [...elementStrings];

    const segmentForSorting = currentArrayState.slice(currentWindowStart, currentWindowStart + windowSegmentSize);

    segmentForSorting.sort();

    currentArrayState.splice(currentWindowStart, windowSegmentSize, ...segmentForSorting);

    const arrangementIdentifier = currentArrayState.join('');

    distinctArrangements.add(arrangementIdentifier);
}

console.log(distinctArrangements.size);
