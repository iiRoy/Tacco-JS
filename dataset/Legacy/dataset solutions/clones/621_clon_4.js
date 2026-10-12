const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedInputLines = rawInputContent.trim().split('\n').filter(Boolean);
const initialEntryCount = Number(processedInputLines.shift());

const aggregatedDataMap = processedInputLines.slice(0, initialEntryCount).reduce((accumulatorMap, currentLineSegment) => {
    const lineComponents = currentLineSegment.split(' ');
    const primaryKey = lineComponents[0];
    const numericalValue = Number(lineComponents[1]);

    accumulatorMap.set(primaryKey, (accumulatorMap.get(primaryKey) || 0) + numericalValue);
    return accumulatorMap;
}, new Map());

const orderedKeys = Array.from(aggregatedDataMap.keys()).sort((firstIdentifier, secondIdentifier) => {
    const lengthComparison = firstIdentifier.length - secondIdentifier.length;
    if (lengthComparison !== 0) {
        return lengthComparison;
    }
    return firstIdentifier.localeCompare(secondIdentifier);
});

orderedKeys.forEach(identifierToPrint => {
    console.log(`${identifierToPrint} ${aggregatedDataMap.get(identifierToPrint)}`);
});
