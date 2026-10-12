const fileSystem = require('node:fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputContent.trim().split('\n');

const targetPhrase = processedLines[0];

const contentSegments = processedLines.slice(1);

const endMarkerIndex = contentSegments.findIndex(segment => segment === 'END_OF_TEXT');

const effectiveContent = endMarkerIndex === -1
    ? contentSegments
    : contentSegments.slice(0, endMarkerIndex);

const escapedTargetPhrase = targetPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const searchExpression = new RegExp(escapedTargetPhrase, 'g');

const finalCount = effectiveContent.reduce((currentTotal, currentLineText) => {
    const foundMatches = currentLineText.match(searchExpression);
    const lineMatchCount = foundMatches ? foundMatches.length : 0;
    return currentTotal + lineMatchCount;
}, 0);

console.log(finalCount);
