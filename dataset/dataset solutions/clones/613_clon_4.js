const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputContent.trim().split('\n');

const elementCount = Number(processedLines.shift());

const dataItems = processedLines;

const derivedValues = Array.from({ length: elementCount - 1 }, (_, firstIdx) => {
    return Array.from({ length: elementCount - 1 - firstIdx }, (_, secondOffset) => {
        const secondIdx = firstIdx + 1 + secondOffset;
        return Number(dataItems[firstIdx] + dataItems[secondIdx]);
    });
}).flat();

derivedValues.sort((valA, valB) => valA - valB);

console.log(derivedValues[2]);
