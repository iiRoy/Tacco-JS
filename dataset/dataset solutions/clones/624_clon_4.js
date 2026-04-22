const standardInput = require('fs').readFileSync('/dev/stdin', 'utf8');

const allLines = standardInput.trim().split('\n');

const numberOfEntries = Number(allLines[0]);

const dataEntries = allLines.slice(1, numberOfEntries + 1);

const aggregatedValues = dataEntries.reduce((accumulatorMap, currentEntry) => {
    const parts = currentEntry.split(' ');
    const identifier = parts[0];
    const value = Number(parts[1]);

    const currentSum = accumulatorMap.get(identifier) || 0;
    accumulatorMap.set(identifier, currentSum + value);
    return accumulatorMap;
}, new Map());

const sortedIdentifiers = Array.from(aggregatedValues.keys()).sort((idA, idB) => {
    if (idA.length !== idB.length) {
        return idA.length - idB.length;
    }
    return idA.localeCompare(idB);
});

const outputLines = sortedIdentifiers.map(keyName => {
    return `${keyName} ${aggregatedValues.get(keyName)}`;
});

console.log(outputLines.join('\n'));