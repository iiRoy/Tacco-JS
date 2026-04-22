const rawInputContent = require('node:fs').readFileSync(0, 'utf8');
const lineSegments = rawInputContent.trim().split('\n');

const elementsCount = Number(lineSegments.shift());
const valueStrings = lineSegments.shift().split(' ');
const processedNumbers = valueStrings.map(Number);

const reductionResult = processedNumbers.reduce((accumulator, currentNumber, elementIndex) => {
    const currentPosition = elementIndex + 1;

    if (accumulator.registryForPositions.has(currentPosition) &&
        accumulator.registryForPositions.get(currentPosition) === currentNumber) {
        
        accumulator.pairCounter++;
    }

    accumulator.registryForPositions.set(currentNumber, currentPosition);

    return accumulator;
}, { pairCounter: 0, registryForPositions: new Map() });

console.log(reductionResult.pairCounter);