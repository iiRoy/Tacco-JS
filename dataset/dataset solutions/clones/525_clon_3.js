const fileSystem = require('fs');

const readInputFileContent = (filePath) => fileSystem.readFileSync(filePath, 'utf8');

const rawInputData = readInputFileContent('/dev/stdin');
const inputLines = rawInputData.trim().split("\n");

const configurationLine = inputLines.shift();
const configurationParameters = configurationLine.split(" ").map(Number);

const maxRangeValue = configurationParameters[0] - 1;
const numberOfElementsToProcess = configurationParameters[1];
const targetSearchValue = configurationParameters[2];

let collectedDataPoints = [];

for (let currentIdx = 0; currentIdx < numberOfElementsToProcess; currentIdx++) {
   const valueAsString = inputLines.shift();
   const parsedValue = parseInt(valueAsString, 10);
   if (parsedValue !== targetSearchValue) {
       collectedDataPoints.push(parsedValue);
   }
}

collectedDataPoints.push(targetSearchValue);

const sortNumericallyAscending = (a, b) => a - b;
collectedDataPoints.sort(sortNumericallyAscending);

let overallMinimumCost = Infinity;

collectedDataPoints.forEach((currentPointValue, pointIndex) => {
    const isFirstPoint = (pointIndex === 0);
    const isLastPoint = (pointIndex === collectedDataPoints.length - 1);
    const previousPointValue = isFirstPoint ? null : collectedDataPoints[pointIndex - 1];
    const nextPointValue = isLastPoint ? null : collectedDataPoints[pointIndex + 1];

    // Case 1: currentPointValue is less than targetSearchValue
    if (currentPointValue < targetSearchValue) {
        const distanceBelowTarget = targetSearchValue - currentPointValue;
        const costFromDistance = distanceBelowTarget * 2;
        const costFromRangeEnd = (maxRangeValue - targetSearchValue + 1);
        const baseCostCalculation = costFromDistance + costFromRangeEnd;

        if (!isFirstPoint) {
            overallMinimumCost = Math.min(overallMinimumCost, baseCostCalculation + previousPointValue);
        } else {
            overallMinimumCost = Math.min(overallMinimumCost, baseCostCalculation);
        }
    }
    // Case 2: currentPointValue is equal to targetSearchValue
    else if (currentPointValue === targetSearchValue) {
        // These are independent minimum updates based on the target point's position
        if (isFirstPoint) {
            const lastPointInArray = collectedDataPoints[collectedDataPoints.length - 1];
            overallMinimumCost = Math.min(overallMinimumCost, lastPointInArray - currentPointValue);
        }
        if (isLastPoint) {
            const firstPointInArray = collectedDataPoints[0];
            overallMinimumCost = Math.min(overallMinimumCost, currentPointValue - firstPointInArray);
        }
        if (!isLastPoint) {
            const sumOfTargetAndMaxRange = targetSearchValue + maxRangeValue;
            const costFromNextPoint = sumOfTargetAndMaxRange - nextPointValue + 1;
            overallMinimumCost = Math.min(overallMinimumCost, costFromNextPoint);
        }
        if (!isFirstPoint) {
            const costFromMaxRangeAndTarget = maxRangeValue - targetSearchValue + 1;
            const costFromPreviousPoint = costFromMaxRangeAndTarget + previousPointValue;
            overallMinimumCost = Math.min(overallMinimumCost, costFromPreviousPoint);
        }
    }
    // Case 3: currentPointValue is greater than targetSearchValue
    else { // currentPointValue > targetSearchValue
        const distanceAboveTarget = currentPointValue - targetSearchValue;
        const costFromDistance = distanceAboveTarget * 2;
        const costFromTargetValue = targetSearchValue;
        const baseCostCalculation = costFromDistance + costFromTargetValue;

        if (!isLastPoint) {
            const remainingRangeAfterNext = maxRangeValue - nextPointValue + 1;
            overallMinimumCost = Math.min(overallMinimumCost, baseCostCalculation + remainingRangeAfterNext);
        } else {
            overallMinimumCost = Math.min(overallMinimumCost, baseCostCalculation);
        }
    }
});

console.log(overallMinimumCost * 100);
