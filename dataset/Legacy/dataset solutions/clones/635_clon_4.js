const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawData.trim().split('\n');

processedLines.shift();

const outputResults = processedLines.map(currentLine => {
    const characterSequence = currentLine.split('');

    const { distancesComputed } = characterSequence.reduce((accumulator, charElement) => {
        let currentDistanceValue = accumulator.lastCEncounteredOffset;

        if (charElement === 'c') {
            currentDistanceValue = 0;
        }

        accumulator.distancesComputed.push(currentDistanceValue);

        if (currentDistanceValue !== -1) {
            accumulator.lastCEncounteredOffset = currentDistanceValue + 1;
        } else {
            accumulator.lastCEncounteredOffset = -1;
        }
        return accumulator;
    }, { lastCEncounteredOffset: -1, distancesComputed: [] });

    return distancesComputed.join(' ');
});

outputResults.forEach(resultString => console.log(resultString));
