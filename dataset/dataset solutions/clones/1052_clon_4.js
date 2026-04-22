const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = rawData.split('\n');

const elementCount = parseInt(dataRows[0], 10);
const primarySet = dataRows[1].trim().split(' ').map(val => parseInt(val, 10));
const requestCount = parseInt(dataRows[2], 10);
const sumQueries = dataRows[3].trim().split(' ').map(val => parseInt(val, 10));

function calculateAttainableSums(sourceArray) {
    const totalMaxSum = sourceArray.reduce((acc, current) => acc + current, 0);
    const sumPossibilities = new Array(totalMaxSum + 1).fill(false);
    sumPossibilities[0] = true;

    for (const numberValue of sourceArray) {
        for (let currentSum = totalMaxSum; currentSum >= numberValue; currentSum--) {
            if (sumPossibilities[currentSum - numberValue]) {
                sumPossibilities[currentSum] = true;
            }
        }
    }
    return sumPossibilities;
}

const possibleSumTracker = calculateAttainableSums(primarySet);

sumQueries.forEach(targetValue => {
    if (targetValue >= 0 && targetValue < possibleSumTracker.length && possibleSumTracker[targetValue]) {
        console.log('yes');
    } else {
        console.log('no');
    }
});