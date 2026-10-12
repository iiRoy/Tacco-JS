var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");
var lineCursor = 0;

var gridDimensions = inputLines[lineCursor].split(" ").map(Number);
lineCursor++;

var numRows = gridDimensions[0];
var numCols = gridDimensions[1];

const segmentCosts = Array.from({ length: numRows - 1 }, () => {
    const cost = Number(inputLines[lineCursor]);
    lineCursor++;
    return cost;
});

const movementActions = Array.from({ length: numCols }, () => {
    const action = Number(inputLines[lineCursor]);
    lineCursor++;
    return action;
});

const segmentHitCounts = Array(numRows - 1).fill(0);

let currentSegmentIdx = 0;

movementActions.forEach(function(actionValue) {
    const directionFactor = (actionValue > 0) ? 1 : -1;
    let stepsToTake = Math.abs(actionValue);

    for (let step = 0; step < stepsToTake; step++) {
        let segmentToMark;
        if (directionFactor === 1) {
            segmentToMark = currentSegmentIdx;
            currentSegmentIdx += directionFactor;
        } else {
            currentSegmentIdx += directionFactor;
            segmentToMark = currentSegmentIdx;
        }
        segmentHitCounts[segmentToMark]++;
    }
});

const finalAccumulatedCost = segmentHitCounts.reduce((accumulator, hitCount, idx) => {
    const costForSegment = segmentCosts[idx];
    let currentSum = accumulator + (costForSegment * hitCount);
    return currentSum % 100000;
}, 0);

console.log(finalAccumulatedCost);
