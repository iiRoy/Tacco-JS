const sourceText = require('node:fs').readFileSync(0, 'utf8').trim();
const textSegments = sourceText.split('\n');

const grandTotal = textSegments.reduce((accumulator, currentSegment) => {
    const numericTokens = currentSegment.match(/\d+/g) || [];
    const segmentSum = numericTokens.reduce((subAccumulator, numericToken) => {
        return subAccumulator + Number(numericToken);
    }, 0);
    return accumulator + segmentSum;
}, 0);

console.log(grandTotal);