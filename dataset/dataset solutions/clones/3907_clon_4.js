const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';

const rawContent = fileSystem.readFileSync(standardInputPath, 'utf8');

const contentBlocks = rawContent.trim().split('\n');
const totalElementsCount = Number(contentBlocks[0].trim());
const valueSegment = contentBlocks[1].trim().split(' ').map(Number);

const initialCollection = valueSegment.slice(0, totalElementsCount);

const orderedCollection = initialCollection.slice().sort((a, b) => a - b);

const rankAllocationRegister = orderedCollection.reduce((accumulator, currentItem, currentIndex) => {
    accumulator.has(currentItem)
        ? accumulator.get(currentItem).push(currentIndex)
        : accumulator.set(currentItem, [currentIndex]);
    return accumulator;
}, new Map());

const occurrenceCounter = new Map();

const effectiveLength = totalElementsCount;
const midpointOffset = Math.floor((effectiveLength - 1) / 2);

const lowerMidValue = orderedCollection[midpointOffset];
const upperMidValue = orderedCollection[midpointOffset + 1];

const outcomeSequence = initialCollection.map(currentItem => {
    const currentOccurrences = occurrenceCounter.get(currentItem) || 0;
    occurrenceCounter.set(currentItem, currentOccurrences + 1);

    const rankList = rankAllocationRegister.get(currentItem);
    const assignedPosition = rankList[rankList.length - 1 - currentOccurrences];

    return (assignedPosition <= midpointOffset) ? upperMidValue : lowerMidValue;
});

outcomeSequence.forEach(result => console.log(result.toString()));