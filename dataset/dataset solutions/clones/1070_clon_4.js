const arrangeSubsegment = (segmentData, initialPosition, finalPosition) => {
    const centralValue = segmentData[finalPosition];
    const lesserElements = [];
    const greaterElements = [];

    for (let currentPos = initialPosition; currentPos < finalPosition; currentPos++) {
        if (segmentData[currentPos] <= centralValue) {
            lesserElements.push(segmentData[currentPos]);
        } else {
            greaterElements.push(segmentData[currentPos]);
        }
    }

    const reorderedSequence = [...lesserElements, centralValue, ...greaterElements];

    for (let k = 0; k < reorderedSequence.length; k++) {
        segmentData[initialPosition + k] = reorderedSequence[k];
    }
    
    return initialPosition + lesserElements.length;
};

const systemInputContent = require('node:fs').readFileSync(0, 'utf8');
const dataLines = systemInputContent.trim().split('\n');

dataLines.shift(); // Discard the first line (count 'n')

const numericSeries = dataLines.shift().split(' ').map(valStr => Number(valStr));

const pivotResultIndex = arrangeSubsegment(numericSeries, 0, numericSeries.length - 1);

numericSeries[pivotResultIndex] = `[${numericSeries[pivotResultIndex]}]`;

console.log(numericSeries.join(' '));