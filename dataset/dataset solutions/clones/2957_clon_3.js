const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLineSegments = rawInputData.split('\n');
const firstLineTokens = inputLineSegments.shift().split(' ');

function calculateDoublingSteps(initialValue, targetThreshold) {
    let workingValue = initialValue;
    let stepCounter = 0;
    while (workingValue < targetThreshold) {
        workingValue = workingValue * 2;
        stepCounter++;
    }
    return stepCounter;
}

const totalIterationsN = Number(firstLineTokens[0]);
const thresholdValueK = Number(firstLineTokens[1]);

let cumulativeProbabilitySum = 0;

for (let currentIterationNum = 1; currentIterationNum <= totalIterationsN; currentIterationNum++) {
    const startingValueForDoubling = currentIterationNum;
    const doublingStepsRequired = calculateDoublingSteps(startingValueForDoubling, thresholdValueK);

    const powerOfTwoDenominator = Math.pow(2, doublingStepsRequired);
    const individualTermContribution = (1 / totalIterationsN) * (1 / powerOfTwoDenominator);
    
    cumulativeProbabilitySum += individualTermContribution;
}

console.log(cumulativeProbabilitySum);
