const initialData = require('node:fs').readFileSync(0, 'utf8').trim().split('\n');
const [firstLineOfInput, secondLineOfInput] = initialData;

const [totalElementsCount, desiredDistinctCount] = firstLineOfInput.split(' ').map(Number);
const inputValues = secondLineOfInput.split(' ');

const valueOccurrences = inputValues.reduce((accumulatorMap, currentItem) => {
    accumulatorMap.set(currentItem, (accumulatorMap.get(currentItem) || 0) + 1);
    return accumulatorMap;
}, new Map());

const currentDistinctCount = valueOccurrences.size;
const distinctToRemove = currentDistinctCount - desiredDistinctCount;

if (distinctToRemove <= 0) {
    console.log(0);
} else {
    const allOccurrenceCounts = Array.from(valueOccurrences.values());
    allOccurrenceCounts.sort((valA, valB) => valA - valB);
    const sumOfRemoved = allOccurrenceCounts.slice(0, distinctToRemove).reduce((totalSum, countValue) => totalSum + countValue, 0);
    console.log(sumOfRemoved);
}