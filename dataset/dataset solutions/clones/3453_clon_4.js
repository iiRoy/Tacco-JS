'use strict';

const formatNumberToSixDigits = (valueToPad) => String(valueToPad).padStart(6, '0');

function processData(sourceInput) {
    const dataLines = sourceInput.split('\n');
    dataLines.shift();

    const parsedEntries = dataLines.map(entryLine => {
        const numericParts = entryLine.split(' ').map(Number);
        return { primaryKey: numericParts[0], secondaryValue: numericParts[1] };
    });

    const groupedAndSortedValues = new Map();

    for (const currentEntry of parsedEntries) {
        if (!groupedAndSortedValues.has(currentEntry.primaryKey)) {
            groupedAndSortedValues.set(currentEntry.primaryKey, []);
        }
        groupedAndSortedValues.get(currentEntry.primaryKey).push(currentEntry.secondaryValue);
    }

    for (const valueCollection of groupedAndSortedValues.values()) {
        valueCollection.sort((valA, valB) => valA - valB);
    }

    for (const originalEntry of parsedEntries) {
        const currentPrimaryKey = originalEntry.primaryKey;
        const currentSecondaryValue = originalEntry.secondaryValue;

        const sortedValuesForCurrentKey = groupedAndSortedValues.get(currentPrimaryKey);
        const calculatedRank = sortedValuesForCurrentKey.indexOf(currentSecondaryValue) + 1;

        const primaryKeyString = formatNumberToSixDigits(currentPrimaryKey);
        const rankString = formatNumberToSixDigits(calculatedRank);

        console.log(primaryKeyString + rankString);
    }
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
