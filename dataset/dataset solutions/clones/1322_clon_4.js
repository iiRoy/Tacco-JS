const dataStreamReader = require('fs');
const completeText = dataStreamReader.readFileSync('/dev/stdin', 'utf8');

const allLines = completeText.trim().split('\n');

const phraseToLocate = allLines[0];

const markerIndex = allLines.indexOf("END_OF_TEXT");

const relevantSections = (markerIndex === -1)
    ? allLines.slice(1)
    : allLines.slice(1, markerIndex);

const sanitizedPhrase = phraseToLocate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const locatorPattern = new RegExp(sanitizedPhrase, 'g');

const finalTally = relevantSections.reduce((cumulativeSum, currentSegment) => {
    const matches = currentSegment.match(locatorPattern);
    return cumulativeSum + (matches ? matches.length : 0);
}, 0);

console.log(finalTally);