const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const sourceLines = inputData.trim().split('\n').filter(Boolean);

const parametersLine = sourceLines.shift();
const systemParameters = parametersLine.split(' ').map(Number);

const overallRangeCeiling = systemParameters[0]; // Corresponds to N_orig in my notes, N_bound in helper functions
const itemCount = systemParameters[1]; // Corresponds to m
const primaryAnchor = systemParameters[2]; // Corresponds to p, targetVal

const uniqueLocations = new Set();
for (let k = 0; k < itemCount; k++) {
    const currentIncomingItem = Number(sourceLines.shift());
    if (currentIncomingItem !== primaryAnchor) {
        uniqueLocations.add(currentIncomingItem);
    }
}
uniqueLocations.add(primaryAnchor);

const orderedLocations = Array.from(uniqueLocations).sort((alpha, beta) => alpha - beta);

// Helper functions for calculating various path costs based on location relative to primaryAnchor
const computeLesserPathCosts = (currentPoint, currentIdx, allPointsArray, anchorPoint, maxRangeValue) => {
    if (currentPoint < anchorPoint && currentIdx !== 0) {
        return [(anchorPoint - currentPoint) * 2 + (maxRangeValue - anchorPoint) + allPointsArray[currentIdx - 1]];
    }
    return [];
};

const computeEqualPathCosts = (currentPoint, currentIdx, allPointsArray, anchorPoint, maxRangeValue) => {
    if (currentPoint !== anchorPoint) {
        return [];
    }
    const candidateCosts = [];
    if (currentIdx === 0) {
        candidateCosts.push(allPointsArray[allPointsArray.length - 1] - currentPoint);
    }
    if (currentIdx === allPointsArray.length - 1) {
        candidateCosts.push(currentPoint - allPointsArray[0]);
    }
    if (currentIdx !== allPointsArray.length - 1) {
        candidateCosts.push(anchorPoint + maxRangeValue - allPointsArray[currentIdx + 1]);
    }
    if (currentIdx !== 0) {
        candidateCosts.push(maxRangeValue - anchorPoint + allPointsArray[currentIdx - 1]);
    }
    return candidateCosts;
};

const computeGreaterPathCosts = (currentPoint, currentIdx, allPointsArray, anchorPoint, maxRangeValue) => {
    if (currentPoint > anchorPoint && currentIdx !== allPointsArray.length - 1) {
        return [(currentPoint - anchorPoint) * 2 + anchorPoint + (maxRangeValue - allPointsArray[currentIdx + 1])];
    }
    return [];
};

// Generate all possible costs using functional programming
const allCalculatedCosts = orderedLocations.flatMap((locationValue, locationIndex) => [
    ...computeLesserPathCosts(locationValue, locationIndex, orderedLocations, primaryAnchor, overallRangeCeiling),
    ...computeEqualPathCosts(locationValue, locationIndex, orderedLocations, primaryAnchor, overallRangeCeiling),
    ...computeGreaterPathCosts(locationValue, locationIndex, orderedLocations, primaryAnchor, overallRangeCeiling)
]);

// Determine the lowest cost. Handle empty array case gracefully (Math.min() on empty returns Infinity).
const lowestCalculatedValue = Math.min(...allCalculatedCosts);

console.log(lowestCalculatedValue * 100);