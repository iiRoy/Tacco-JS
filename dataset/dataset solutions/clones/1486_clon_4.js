const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const dataLines = inputSource.split('\n');
const [initialN, limitK] = dataLines[0].split(' ').map(Number);

const MAX_INDEX_VALUE = 300001;
const segmentTreeNodes = new Array(4 * MAX_INDEX_VALUE).fill(0);
const lazyPropagationValues = new Array(4 * MAX_INDEX_VALUE).fill(0);

function propagateLazy(nodeIndex) {
    if (lazyPropagationValues[nodeIndex] !== 0) {
        segmentTreeNodes[2 * nodeIndex] = Math.max(segmentTreeNodes[2 * nodeIndex], lazyPropagationValues[nodeIndex]);
        segmentTreeNodes[2 * nodeIndex + 1] = Math.max(segmentTreeNodes[2 * nodeIndex + 1], lazyPropagationValues[nodeIndex]);

        lazyPropagationValues[2 * nodeIndex] = Math.max(lazyPropagationValues[2 * nodeIndex], lazyPropagationValues[nodeIndex]);
        lazyPropagationValues[2 * nodeIndex + 1] = Math.max(lazyPropagationValues[2 * nodeIndex + 1], lazyPropagationValues[nodeIndex]);

        lazyPropagationValues[nodeIndex] = 0;
    }
}

function updateSegmentRange(nodeIndex, currentStart, currentEnd, queryStart, queryEnd, newValue) {
    if (currentStart > currentEnd || currentStart > queryEnd || currentEnd < queryStart) {
        return;
    }

    if (queryStart <= currentStart && currentEnd <= queryEnd) {
        segmentTreeNodes[nodeIndex] = Math.max(segmentTreeNodes[nodeIndex], newValue);
        lazyPropagationValues[nodeIndex] = Math.max(lazyPropagationValues[nodeIndex], newValue);
        return;
    }

    propagateLazy(nodeIndex);

    const midPoint = Math.floor((currentStart + currentEnd) / 2);
    updateSegmentRange(2 * nodeIndex, currentStart, midPoint, queryStart, queryEnd, newValue);
    updateSegmentRange(2 * nodeIndex + 1, midPoint + 1, currentEnd, queryStart, queryEnd, newValue);

    segmentTreeNodes[nodeIndex] = Math.max(segmentTreeNodes[2 * nodeIndex], segmentTreeNodes[2 * nodeIndex + 1]);
}

function queryPointValue(nodeIndex, currentStart, currentEnd, targetIndex) {
    if (currentStart === currentEnd) {
        return segmentTreeNodes[nodeIndex];
    }

    propagateLazy(nodeIndex);

    const midPoint = Math.floor((currentStart + currentEnd) / 2);
    if (targetIndex <= midPoint) {
        return queryPointValue(2 * nodeIndex, currentStart, midPoint, targetIndex);
    } else {
        return queryPointValue(2 * nodeIndex + 1, midPoint + 1, currentEnd, targetIndex);
    }
}

for (let i = 1; i <= initialN; i++) {
    const currentElementValue = Number(dataLines[i]);

    const previousMaxSequenceLength = queryPointValue(1, 0, MAX_INDEX_VALUE - 1, currentElementValue);
    const newCalculatedLength = previousMaxSequenceLength + 1;

    const lowerBound = Math.max(0, currentElementValue - limitK);
    const upperBound = currentElementValue + limitK;

    updateSegmentRange(1, 0, MAX_INDEX_VALUE - 1, lowerBound, upperBound, newCalculatedLength);
}

console.log(segmentTreeNodes[1]);
