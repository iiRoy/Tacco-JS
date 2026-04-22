const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const relevantSection = inputContent.split('END_OF_TEXT')[0];
const trimmedSection = relevantSection.replace(/^\s+|\s+$/g, '');
const lineComponents = trimmedSection.split(/\r?\n/);

const keyTerm = lineComponents[0].toLowerCase();
const subsequentLines = lineComponents.slice(1);

const contentAsSingleString = subsequentLines.join('');
const individualUnits = contentAsSingleString.split(' ').filter(Boolean);

const finalTally = individualUnits.reduce((currentTotal, currentWord) => {
    return currentTotal + (currentWord.toLowerCase() === keyTerm ? 1 : 0);
}, 0);

console.log(finalTally);