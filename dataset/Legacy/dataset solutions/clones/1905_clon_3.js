const incrementMapValue = (targetMap, keyIdentifier) => {
    targetMap[keyIdentifier] = (targetMap[keyIdentifier] || 0) + 1;
};

const retrieveMapValue = (sourceMap, keyIdentifier) => {
    return sourceMap[keyIdentifier] || 0;
};

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const arrayLength = Number(inputLines[0]);
const dataArray = inputLines[1].split(' ').map(Number);

const targetSumFrequencies = {};

dataArray.forEach((currentValue, currentIndex) => {
    const firstSumComponent = currentValue + currentIndex + 1;
    incrementMapValue(targetSumFrequencies, firstSumComponent);
});

let pairCount = 0;

dataArray.forEach((elementValue, elementIndex) => {
    const secondSumComponent = elementIndex + 1 - elementValue;
    pairCount += retrieveMapValue(targetSumFrequencies, secondSumComponent);
});

console.log(pairCount);
