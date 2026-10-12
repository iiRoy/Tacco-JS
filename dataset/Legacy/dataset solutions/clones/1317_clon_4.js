const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = sourceData.split('\n');

const primaryString = processedLines[0];
const subsequenceCandidate = processedLines[1];

const concatenatedPrimary = primaryString + primaryString;

const escapedPattern = subsequenceCandidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matchExpression = new RegExp(escapedPattern);

const foundStatus = matchExpression.test(concatenatedPrimary);

if (foundStatus) {
    console.log('Yes');
} else {
    console.log('No');
}
