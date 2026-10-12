const fs = require("fs");

const inputContent = fs.readFileSync("/dev/stdin", "utf8");

const wordSegments = inputContent.trim().split(' ');

const aggregatedMetrics = wordSegments.reduce((accumulator, currentSegment) => {
    const currentSegmentCount = (accumulator.segmentCounts.get(currentSegment) || 0) + 1;
    accumulator.segmentCounts.set(currentSegment, currentSegmentCount);

    accumulator.highestCount = Math.max(accumulator.highestCount, currentSegmentCount);

    const segmentLength = currentSegment.length;
    if (segmentLength > accumulator.greatestLength) {
        accumulator.greatestLength = segmentLength;
        accumulator.longestSegment = currentSegment;
    }

    return accumulator;
}, {
    segmentCounts: new Map(),
    highestCount: 0,
    longestSegment: '',
    greatestLength: 0
});

console.log(aggregatedMetrics.highestCount + ' ' + aggregatedMetrics.longestSegment);
