const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.split('\n');

const firstGroupValues = inputLines.slice(0, 3).map(value => Number(value));
const secondGroupValues = inputLines.slice(3, 5).map(value => Number(value));

const minimumFromFirstGroup = firstGroupValues.reduce((currentMinimum, nextValue) => {
    return nextValue < currentMinimum ? nextValue : currentMinimum;
}, Infinity);

const minimumFromSecondGroup = secondGroupValues.reduce((currentMinimum, nextValue) => {
    return nextValue < currentMinimum ? nextValue : currentMinimum;
}, Infinity);

const finalCalculatedResult = minimumFromFirstGroup + minimumFromSecondGroup - 50;

console.log(finalCalculatedResult);
