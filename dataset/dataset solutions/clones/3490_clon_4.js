'use strict'

const processData = (rawDataInput) => {
    const linesOfText = rawDataInput.trim().split('\n');

    const [itemCount, durationThreshold] = linesOfText[0].split(' ').map(Number);

    const relevantEntries = linesOfText.slice(1, itemCount + 1);

    const qualifyingOptions = relevantEntries
        .map(entryString => {
            const parts = entryString.split(' ').map(Number);
            return { costValue: parts[0], timeTaken: parts[1] };
        })
        .filter(option => option.timeTaken < durationThreshold);

    if (qualifyingOptions.length === 0) {
        return 'TLE';
    } else {
        const minimumCostFound = qualifyingOptions.reduce((currentMin, currentOption) => {
            return Math.min(currentMin, currentOption.costValue);
        }, Infinity);
        return minimumCostFound;
    }
};

const fileContent = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

const finalOutcome = processData(fileContent);

console.log(finalOutcome);