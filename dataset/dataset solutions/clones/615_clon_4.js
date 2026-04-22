const sourceData = require('node:fs').readFileSync(0, 'utf8');

const transformedInput = sourceData
    .trim()
    .split('\n')
    .slice(1)
    .map(val => val.trim())
    .sort((valA, valB) => Number(valA) - Number(valB))
    .slice(0, 5);

const combinedNumbers = transformedInput.flatMap((firstElement, currentIndex, fullArray) =>
    fullArray.slice(currentIndex + 1).flatMap(secondElement => [
        Number(firstElement + secondElement),
        Number(secondElement + firstElement)
    ])
);

const orderedResults = combinedNumbers.sort((x, y) => x - y);

console.log(orderedResults[2]);