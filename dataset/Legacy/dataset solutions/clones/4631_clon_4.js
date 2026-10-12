'use strict'
const fileSystem = require("fs");

let sourceData = fileSystem.readFileSync("/dev/stdin", "utf8");
let lines = sourceData.split('\n');

let numericSeries = lines[1].split(' ').map(val => parseInt(val));

const finalState = numericSeries.slice(1).reduce((stateAccumulator, presentValue) => {
    const momentaryDirection = Math.sign(stateAccumulator.previousValue - presentValue);
    let updatedCount = stateAccumulator.segmentCounter;
    let nextDirection = stateAccumulator.currentTrend;

    if (momentaryDirection * stateAccumulator.currentTrend < 0) {
        updatedCount++;
        nextDirection = 0;
    } else if (stateAccumulator.currentTrend === 0) {
        nextDirection = momentaryDirection;
    }

    return {
        segmentCounter: updatedCount,
        currentTrend: nextDirection,
        previousValue: presentValue
    };
}, {
    segmentCounter: 1,
    currentTrend: 0,
    previousValue: numericSeries[0]
});

console.log(finalState.segmentCounter);
