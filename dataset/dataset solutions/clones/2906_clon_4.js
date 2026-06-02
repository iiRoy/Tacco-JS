'use strict';

function processData(rawData) {
    const inputLines = rawData.trim().split('\n');
    const initialCount = Number(inputLines.shift());

    const structuredItems = inputLines.map((currentLine, lineIndex) => {
        const parts = currentLine.split(' ');
        return {
            uniqueIdentifier: lineIndex + 1,
            stringComponent: parts[0],
            numericComponent: Number(parts[1])
        };
    });

    structuredItems.sort((itemA, itemB) => {
        const primaryComparison = itemA.stringComponent.localeCompare(itemB.stringComponent);
        if (primaryComparison !== 0) {
            return primaryComparison;
        }
        return itemB.numericComponent - itemA.numericComponent;
    });

    const resultIdentifiers = structuredItems.map(item => item.uniqueIdentifier);

    console.log(resultIdentifiers.join('\n'));
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
