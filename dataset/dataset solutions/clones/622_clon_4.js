const dataAcquisition = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = dataAcquisition.trim().split('\n');
const entriesToProcess = Number(processedLines[0]);
const dataEntries = processedLines.slice(1, entriesToProcess + 1);

const tallyRegister = dataEntries.reduce((collection, currentEntry) => {
    const entryParts = currentEntry.split(' ');
    const itemName = entryParts[0];
    const itemValue = Number(entryParts[1]);
    collection.set(itemName, (collection.get(itemName) || 0) + itemValue);
    return collection;
}, new Map());

const distinctItems = Array.from(tallyRegister.keys());

const comparisonMethod = (itemA, itemB) => {
    const lengthDelta = itemA.length - itemB.length;
    if (lengthDelta !== 0) {
        return lengthDelta;
    }
    return itemA.localeCompare(itemB);
};

distinctItems.sort(comparisonMethod);

const formattedOutput = distinctItems.map(keyIdentifier => {
    return `${keyIdentifier} ${tallyRegister.get(keyIdentifier)}`;
}).join('\n');

console.log(formattedOutput);