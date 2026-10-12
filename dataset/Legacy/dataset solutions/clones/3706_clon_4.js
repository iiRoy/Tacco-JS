"use strict";

const processInputData = (rawData) => {
    const dataLines = rawData.split('\n');
    const elementCount = Number(dataLines[0]);
    const numericValues = dataLines[1].split(/\s+/).map(Number).slice(0, elementCount);
    return { elementCount, numericValues };
};

const calculateCumulativeSums = (valuesArray) =>
    valuesArray.reduce((accumulator, currentValue, index) => {
        accumulator.push((index === 0 ? 0 : accumulator[index - 1]) + currentValue);
        return accumulator;
    }, []);

const determineOptimalPartitionPoints = (cumulativeSums, totalElements) => {
    const optimalLeftSplits = new Array(totalElements);
    const optimalRightSplits = new Array(totalElements);

    let currentLeftPointer = 0;
    for (let midPoint = 1; midPoint <= totalElements - 2; ++midPoint) {
        while (currentLeftPointer < midPoint - 1) {
            const firstSegmentSum = cumulativeSums[currentLeftPointer];
            const secondSegmentSum = cumulativeSums[midPoint] - cumulativeSums[currentLeftPointer];
            const currentAbsoluteDifference = Math.abs(firstSegmentSum - secondSegmentSum);

            const nextFirstSegmentSum = cumulativeSums[currentLeftPointer + 1];
            const nextSecondSegmentSum = cumulativeSums[midPoint] - cumulativeSums[currentLeftPointer + 1];
            const nextAbsoluteDifference = Math.abs(nextFirstSegmentSum - nextSecondSegmentSum);

            if (nextAbsoluteDifference < currentAbsoluteDifference) {
                currentLeftPointer++;
            } else {
                break;
            }
        }
        optimalLeftSplits[midPoint] = currentLeftPointer;
    }

    let currentRightPointer = totalElements - 2;
    for (let midPoint = totalElements - 2; midPoint >= 1; --midPoint) {
        while (currentRightPointer > midPoint + 1) {
            const thirdSegmentSum = cumulativeSums[currentRightPointer] - cumulativeSums[midPoint];
            const fourthSegmentSum = cumulativeSums[totalElements - 1] - cumulativeSums[currentRightPointer];
            const currentAbsoluteDifference = Math.abs(thirdSegmentSum - fourthSegmentSum);

            const previousThirdSegmentSum = cumulativeSums[currentRightPointer - 1] - cumulativeSums[midPoint];
            const previousFourthSegmentSum = cumulativeSums[totalElements - 1] - cumulativeSums[currentRightPointer - 1];
            const previousAbsoluteDifference = Math.abs(previousThirdSegmentSum - previousFourthSegmentSum);

            if (previousAbsoluteDifference < currentAbsoluteDifference) {
                currentRightPointer--;
            } else {
                break;
            }
        }
        optimalRightSplits[midPoint] = currentRightPointer;
    }
    return { optimalLeftSplits, optimalRightSplits };
};

const findMinimumOverallDifference = (cumulativeSums, totalElements, optimalLeftSplits, optimalRightSplits) => {
    let minimumRangeDifference = Infinity;

    // The middle cut point 'midPoint' iterates from 1 to totalElements - 3 (inclusive).
    for (let midPoint = 1; midPoint <= totalElements - 3; ++midPoint) {
        const leftCutIndex = optimalLeftSplits[midPoint];
        // The original code's 'rs' array was reversed, meaning rs[k] corresponded to the optimal right cut for (N-2)-k.
        // So, to get the correct right cut for 'midPoint', we need to access optimalRightSplits[(totalElements - 2) - midPoint].
        const rightCutIndex = optimalRightSplits[(totalElements - 2) - midPoint];

        const partOne = cumulativeSums[leftCutIndex];
        const partTwo = cumulativeSums[midPoint] - cumulativeSums[leftCutIndex];
        const partThree = cumulativeSums[rightCutIndex] - cumulativeSums[midPoint];
        const partFour = cumulativeSums[totalElements - 1] - cumulativeSums[rightCutIndex];

        const currentMinimumValue = Math.min(partOne, partTwo, partThree, partFour);
        const currentMaximumValue = Math.max(partOne, partTwo, partThree, partFour);

        minimumRangeDifference = Math.min(minimumRangeDifference, currentMaximumValue - currentMinimumValue);
    }
    return minimumRangeDifference;
};

const executeSolution = (inputContent) => {
    const { elementCount, numericValues } = processInputData(inputContent);
    const cumulativeSums = calculateCumulativeSums(numericValues);
    const { optimalLeftSplits, optimalRightSplits } = determineOptimalPartitionPoints(cumulativeSums, elementCount);
    const finalResult = findMinimumOverallDifference(cumulativeSums, elementCount, optimalLeftSplits, optimalRightSplits);
    console.log(finalResult);
};

executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));
