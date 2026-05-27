'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

const findLargestElement = (dataArray) => {
    return dataArray.reduce((currentMax, value) => (value > currentMax ? value : currentMax), -Infinity);
};

const findSmallestElement = (dataArray) => {
    return dataArray.reduce((currentMin, value) => (value < currentMin ? value : currentMin), Infinity);
};

const processInputAndCalculate = (inputContent) => {
    const [firstLine, secondLine] = inputContent.split('\n');
    const totalElements = Number(firstLine);
    const heightSequence = secondLine.split(' ').map(Number);

    const memoizedCosts = new Map();

    const calculateMinimumCost = (stepIndex) => {
        if (stepIndex === 0) {
            return 0;
        }
        if (stepIndex === 1) {
            return Math.abs(heightSequence[0] - heightSequence[1]);
        }
        if (memoizedCosts.has(stepIndex)) {
            return memoizedCosts.get(stepIndex);
        }

        const costFromTwoStepsBack = calculateMinimumCost(stepIndex - 2) + Math.abs(heightSequence[stepIndex] - heightSequence[stepIndex - 2]);
        const costFromOneStepBack = calculateMinimumCost(stepIndex - 1) + Math.abs(heightSequence[stepIndex] - heightSequence[stepIndex - 1]);

        const currentStepMinCost = Math.min(costFromTwoStepsBack, costFromOneStepBack);
        memoizedCosts.set(stepIndex, currentStepMinCost);
        return currentStepMinCost;
    };

    const minimumCosts = Array.from({ length: totalElements }, (_, index) => calculateMinimumCost(index));

    console.log(heightSequence);
    console.log(minimumCosts, minimumCosts[totalElements - 1]);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8").trim());
