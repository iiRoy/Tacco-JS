'use strict';

const programData = require('node:fs').readFileSync(0, 'utf8');
const processedSegments = programData.trim().split('\n');

const totalElements = Number(processedSegments[0]);
const elementValues = processedSegments[1].split(' ').map(Number);

const valToPos = new Array(totalElements);
for (let p = 0; p < totalElements; ++p) {
    valToPos[elementValues[p] - 1] = p;
}

let overallTotal = 0;

function calculateSegmentSum(startIdx, endIdx, minValSearchKey) {
    if (startIdx > endIdx) {
        return;
    }
    if (startIdx === endIdx) {
        overallTotal += elementValues[startIdx];
        return;
    }

    let currentMinValKey = minValSearchKey;
    while (valToPos[currentMinValKey] < startIdx || valToPos[currentMinValKey] > endIdx) {
        currentMinValKey++;
    }

    const minElementOriginalPos = valToPos[currentMinValKey];
    const minElementValue = elementValues[minElementOriginalPos];

    overallTotal += minElementValue * (minElementOriginalPos - startIdx + 1) * (endIdx - minElementOriginalPos + 1);

    calculateSegmentSum(startIdx, minElementOriginalPos - 1, currentMinValKey + 1);
    calculateSegmentSum(minElementOriginalPos + 1, endIdx, currentMinValKey + 1);
}

calculateSegmentSum(0, totalElements - 1, 0);

console.log(overallTotal);