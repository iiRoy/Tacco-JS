const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const arrayLength = +inputLines[0];
const dataArray = inputLines[1].split(' ').map(Number);

const valueSumFrequencies = dataArray.reduce((accumulatorMap, elementValue, currentIndex) => {
    const keyForSum = elementValue + currentIndex;
    accumulatorMap.set(keyForSum, (accumulatorMap.get(keyForSum) || 0) + 1);
    return accumulatorMap;
}, new Map());

const totalPairCount = dataArray.reduce((accumulatorCount, elementValue, currentIndex) => {
    const keyForDifference = currentIndex - elementValue;
    return accumulatorCount + (valueSumFrequencies.get(keyForDifference) || 0);
}, 0);

console.log(totalPairCount);
