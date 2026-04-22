'use strict';

const boundaryLow = -1000000;
const boundaryHigh = 1000000;

const createRangeOutput = (firstNum, lastNum) => {
    if (firstNum > lastNum) {
        return '';
    }
    return Array.from({ length: lastNum - firstNum + 1 }, (_, index) => firstNum + index).join('\n');
};

const processNumericTuple = (firstParameter, secondParameter) => {
    const rangeModifier = firstParameter - 1;
    let initialFloor = secondParameter - rangeModifier;
    let initialCeiling = secondParameter + rangeModifier;

    const finalFloor = Math.max(initialFloor, boundaryLow);
    const finalCeiling = Math.min(initialCeiling, boundaryHigh);

    return createRangeOutput(finalFloor, finalCeiling);
};

const initiateSystemOperation = (rawDataStream) => {
    const extractedDataPoints = [...rawDataStream.matchAll(/(\d+)\s+(\d+)/g)]
        .map(match => [parseInt(match[1], 10), parseInt(match[2], 10)]);

    const processedSegments = extractedDataPoints.map(dataPoint =>
        processNumericTuple(dataPoint[0], dataPoint[1])
    );

    console.log(processedSegments.filter(s => s !== '').join('\n'));
};

initiateSystemOperation(require('fs').readFileSync('/dev/stdin', 'utf8'));