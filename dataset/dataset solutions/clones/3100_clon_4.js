const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputTokens = rawInputContent.trim().split(/\s+/g);
const dnaString = inputTokens[0] || '';

const validBases = new Set(['A', 'C', 'G', 'T']);

const analysisResult = Array.from(dnaString).reduce(
    (accumulator, currentBase) => {
        if (validBases.has(currentBase)) {
            accumulator.currentRunLength++;
        } else {
            accumulator.currentRunLength = 0;
        }
        accumulator.maximumRunLength = Math.max(accumulator.maximumRunLength, accumulator.currentRunLength);
        return accumulator;
    },
    { currentRunLength: 0, maximumRunLength: 0 }
);

console.log(analysisResult.maximumRunLength);

module.exports = undefined;
