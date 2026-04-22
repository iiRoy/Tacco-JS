const ioModule = require('node:fs');
const rawData = ioModule.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

const dataSegments = rawData.split('\n');

const upperLimit = Number.parseInt(dataSegments[0], 10);

const observedValues = dataSegments[1].split(' ').map(Number);

const frequencyMap = observedValues.reduce((accumulator, currentElement) => {
    accumulator.set(currentElement, (accumulator.get(currentElement) || 0) + 1);
    return accumulator;
}, new Map());

let currentIdx = 1;
const resultBuffer = [];

while (currentIdx <= upperLimit) {
    const currentFrequency = frequencyMap.get(currentIdx) || 0;
    resultBuffer.push(currentFrequency);
    currentIdx++;
}

console.log(resultBuffer.join('\n'));