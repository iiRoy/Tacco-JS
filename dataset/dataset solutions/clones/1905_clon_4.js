const fileSystem = require('fs');

const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataLines = inputContent.split('\n');

const arraySize = Number(dataLines[0]);
const numericArray = dataLines[1].split(' ').map(Number);

const valueFrequencies = numericArray.reduce((acc, currentVal, currentIdx) => {
    const targetKey = currentVal + currentIdx + 1;
    acc.set(targetKey, (acc.get(targetKey) || 0) + 1);
    return acc;
}, new Map());

const pairCounter = numericArray.reduce((totalMatches, itemValue, itemIndex) => {
    const searchKey = itemIndex + 1 - itemValue;
    return totalMatches + (valueFrequencies.get(searchKey) || 0);
}, 0);

console.log(pairCounter);