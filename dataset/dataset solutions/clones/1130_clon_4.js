const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

const parsedLines = dataStream.trim().split('\n');
let [ targetValue, numDenominations ] = parsedLines[0].split(' ');
targetValue = Number(targetValue);
numDenominations = Number(numDenominations);
let coinDenominations = parsedLines[1].trim().split(' ');
coinDenominations = coinDenominations.map(val => Number(val));

const unreachableCost = Infinity;
const memoizedResults = new Map();
memoizedResults.set(0, 0);

console.log(memoizedResults);
console.log(memoizedResults.get(targetValue));

const calculateMinimumOperations = (currentSumGoal) => {
    if (memoizedResults.has(currentSumGoal)) {
        return memoizedResults.get(currentSumGoal);
    }

    if (currentSumGoal < 0) {
        return unreachableCost;
    }

    let currentMinimum = unreachableCost;

    for (const coinValue of coinDenominations) {
        const remainingSum = currentSumGoal - coinValue;
        const subProblemResult = calculateMinimumOperations(remainingSum);

        if (subProblemResult !== unreachableCost) {
            currentMinimum = Math.min(currentMinimum, subProblemResult + 1);
        }
    }

    memoizedResults.set(currentSumGoal, currentMinimum);
    return currentMinimum;
};

calculateMinimumOperations(targetValue);

console.log(memoizedResults.get(targetValue));
