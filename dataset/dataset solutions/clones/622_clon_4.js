const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const parsedLines = rawInputContent.trim().split('\n');

const initialLineCount = Number(parsedLines[0]);
const dataEntryLines = parsedLines.slice(1, initialLineCount + 1);

const aggregatedValueMap = dataEntryLines.reduce((accumulatorMap, currentEntryLine) => {
    const [keyComponent, valueComponent] = currentEntryLine.split(' ');
    const numericalValue = Number(valueComponent);

    accumulatorMap.set(keyComponent, (accumulatorMap.get(keyComponent) || 0) + numericalValue);
    return accumulatorMap;
}, new Map());

const sortedUniqueKeys = Array.from(aggregatedValueMap.keys()).sort((firstElement, secondElement) => {
    const lengthComparison = firstElement.length - secondElement.length;
    if (lengthComparison !== 0) {
        return lengthComparison;
    }
    return firstElement.localeCompare(secondElement);
});

const formattedOutputLines = sortedUniqueKeys.map(currentKeyElement => {
    return `${currentKeyElement} ${aggregatedValueMap.get(currentKeyElement)}`;
});

console.log(formattedOutputLines.join('\n'));
