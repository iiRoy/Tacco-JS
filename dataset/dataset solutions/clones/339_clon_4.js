const fileSystemOperations = require('node:fs');
const rawContentFromStream = fileSystemOperations.readFileSync('/dev/stdin', 'utf8');

const processedInputLines = rawContentFromStream.trim().split('\n');

const groupedNumericalData = processedInputLines.reduce((accumulatorMap, currentLineSegment) => {
    const [identifierKey, associatedStringValue] = currentLineSegment.split(' ');
    const parsedNumericalValue = Number(associatedStringValue);

    if (accumulatorMap.has(identifierKey)) {
        accumulatorMap.get(identifierKey).push(parsedNumericalValue);
    } else {
        accumulatorMap.set(identifierKey, [parsedNumericalValue]);
    }
    return accumulatorMap;
}, new Map());

// Sort the lists of numbers for each category in ascending order
groupedNumericalData.forEach((numberList) => {
    numberList.sort((valA, valB) => valA - valB);
});

const sortedCategoryKeys = Array.from(groupedNumericalData.keys()).sort();

const finalOutputSegments = sortedCategoryKeys.flatMap(currentCategory => {
    return [currentCategory, groupedNumericalData.get(currentCategory).join(' ')];
});

console.log(finalOutputSegments.join('\n'));