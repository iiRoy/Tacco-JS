var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

var dataRows = sourceData.split('\n');
var baseLength = Number(dataRows[0]);
var baseNumbers = dataRows.slice(1, baseLength + 1).map(Number);

const retrieveCircularElement = (idx) => baseNumbers[idx % baseLength];

const calculateSegmentTotal = (start, end) => {
    if (start >= end) return 0;
    return Array.from({ length: end - start }, (_, offset) =>
        retrieveCircularElement(start + offset)
    ).reduce((accumulator, currentVal) => accumulator + currentVal, 0);
};

const getComparisonArray = (start, end) => {
    const segment = [];
    for (let current = start; current < end; current++) {
        segment.push(retrieveCircularElement(current));
    }
    return segment;
};

let initialMax = 0;

const allPotentialMaxValues = Array.from({ length: Math.max(0, baseLength - 3) }, (_, segmentLengthOffset) => {
    const currentSegmentLength = segmentLengthOffset + 1;

    return Array.from({ length: baseLength }, (_, startPosition) => {
        const firstSegmentSum = calculateSegmentTotal(startPosition, startPosition + currentSegmentLength);

        const comparisonArray = getComparisonArray(startPosition + currentSegmentLength, startPosition + baseLength);

        const remainingSegmentLength = baseLength - currentSegmentLength;
        if (remainingSegmentLength < 2) {
            return [];
        }

        return Array.from({ length: remainingSegmentLength - 1 }, (_, splitOffset) => {
            const splitPoint = splitOffset + 1;

            const segmentTwoStart = startPosition + currentSegmentLength;
            const segmentTwoSplit = segmentTwoStart + splitPoint;
            const segmentTwoEnd = startPosition + baseLength;

            const firstSubSegmentSum = calculateSegmentTotal(segmentTwoStart, segmentTwoSplit);
            const secondSubSegmentSum = calculateSegmentTotal(segmentTwoSplit, segmentTwoEnd);

            const currentMin = Math.min(firstSubSegmentSum, secondSubSegmentSum);

            if (comparisonArray <= currentMin) {
                return firstSegmentSum;
            }
            return 0;
        });
    });
}).flat(2);

initialMax = allPotentialMaxValues.reduce((currentMax, val) => Math.max(currentMax, val), 0);

console.log(initialMax);
