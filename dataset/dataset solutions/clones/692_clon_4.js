const fileSystemInterface = require('fs');
const rawDataString = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawDataString.trim().split('\n');

const determineSmallestPositiveDifference = (topValue) => {
    const targetCubeValue = topValue * topValue * topValue;
    let largestSumOfCubesLessThanTarget = 0;

    const availableCubes = [];
    for (let currentInteger = 1; currentInteger < topValue; currentInteger++) {
        availableCubes.push(currentInteger * currentInteger * currentInteger);
    }

    for (let indexForA = availableCubes.length - 1; indexForA >= 0; indexForA--) {
        const cubeA = availableCubes[indexForA];

        for (let indexForB = indexForA; indexForB >= 0; indexForB--) {
            const cubeB = availableCubes[indexForB];
            const currentCubesSum = cubeA + cubeB;

            if (currentCubesSum < targetCubeValue) {
                if (currentCubesSum > largestSumOfCubesLessThanTarget) {
                    largestSumOfCubesLessThanTarget = currentCubesSum;
                }
            }
        }
    }

    if (largestSumOfCubesLessThanTarget === 0) {
        return Number.POSITIVE_INFINITY;
    }

    return targetCubeValue - largestSumOfCubesLessThanTarget;
};

const processRemainingEntries = (remainingInputSegments, collectedResults) => {
    if (remainingInputSegments.length === 0) {
        return;
    }

    const currentNumericEntry = Number(remainingInputSegments[0]);
    if (currentNumericEntry === 0) {
        return;
    }

    const computedResult = determineSmallestPositiveDifference(currentNumericEntry);
    collectedResults.push(computedResult);

    processRemainingEntries(remainingInputSegments.slice(1), collectedResults);
};

const finalResultCollection = [];
processRemainingEntries(processedLines, finalResultCollection);

finalResultCollection.forEach(outcome => console.log(outcome));