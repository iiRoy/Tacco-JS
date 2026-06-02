const fileSystem = require('node:fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputLines = rawData.trim().split('\n').filter(Boolean);

const [numM, numN] = inputLines.shift().split(' ').map(Number);

const segmentCosts = inputLines.splice(0, numM - 1).map(Number);

const movementValues = inputLines.map(Number);

const traversalCounts = Array(numM - 1).fill(0);

const finalPosition = movementValues.reduce((currentPoint, displacement) => {
    const absoluteDisplacement = Math.abs(displacement);
    const directionIndicator = displacement > 0 ? 1 : -1;

    let segmentStartBoundary, segmentEndBoundary;

    if (directionIndicator === 1) {
        segmentStartBoundary = currentPoint;
        segmentEndBoundary = currentPoint + absoluteDisplacement - 1;
    } else {
        segmentStartBoundary = currentPoint + displacement;
        segmentEndBoundary = currentPoint - 1;
    }

    for (let segmentIndex = segmentStartBoundary; segmentIndex <= segmentEndBoundary; segmentIndex++) {
        traversalCounts[segmentIndex]++;
    }

    return currentPoint + displacement;
}, 0);

const calculatedTotalCost = segmentCosts.reduce((accumulatedCost, costPerUnit, segmentIndex) => {
    const segmentTraversals = traversalCounts[segmentIndex];
    const segmentContribution = costPerUnit * segmentTraversals;
    return (accumulatedCost + segmentContribution) % 100000;
}, 0);

console.log(calculatedTotalCost);
