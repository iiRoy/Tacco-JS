const fileSystemModule = require('fs');

const retrieveAndProcess = () => {
    const rawDataBuffer = fileSystemModule.readFileSync('/dev/stdin');
    const textContent = rawDataBuffer.toString('utf8');
    const firstLineValue = textContent.split('\n')[0];
    return parseFloat(firstLineValue);
};

const integrateSquaredIntervals = (intervalWidth, ceilingValue, currentIteration = 1, cumulativeSum = 0) => {
    const currentPoint = currentIteration * intervalWidth;
    if (currentPoint >= ceilingValue) {
        return Math.round(cumulativeSum);
    } else {
        const segmentContribution = Math.pow(currentPoint, 2) * intervalWidth;
        return integrateSquaredIntervals(intervalWidth, ceilingValue, currentIteration + 1, cumulativeSum + segmentContribution);
    }
};

const fixedUpperBoundary = 600;
const inputParameter = retrieveAndProcess();
console.log(integrateSquaredIntervals(inputParameter, fixedUpperBoundary));