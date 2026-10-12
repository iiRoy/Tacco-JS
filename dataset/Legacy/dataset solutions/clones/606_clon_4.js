const sourceText = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedText = sourceText.trim();

const pattern = /(J+)(O+)(I+)/g;

const peakValue = Array.from(processedText.matchAll(pattern)).reduce((currentMax, currentMatch) => {
    const jSequence = currentMatch[1];
    const oSequence = currentMatch[2];
    const iSequence = currentMatch[3];

    const candidateValue = (jSequence.length >= oSequence.length && iSequence.length >= oSequence.length)
        ? oSequence.length
        : 0;

    return Math.max(currentMax, candidateValue);
}, 0);

console.log(peakValue);
