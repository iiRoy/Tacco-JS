const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = sourceContent.trim().split('\n');

const entryCount = Number(dataLines.shift());

const valueAggregator = dataLines.slice(0, entryCount).reduce((accumulatorMap, currentEntry) => {
    const [identifier, quantityText] = currentEntry.split(' ');
    const numericQuantity = parseInt(quantityText, 10);

    accumulatorMap.set(identifier, (accumulatorMap.get(identifier) || 0) + numericQuantity);
    return accumulatorMap;
}, new Map());

const sortedIdentifiers = Array.from(valueAggregator.keys()).sort();

const outputString = sortedIdentifiers.map(keyIdentifier => {
    return `${keyIdentifier} ${valueAggregator.get(keyIdentifier)}`;
}).join('\n');

console.log(outputString);
