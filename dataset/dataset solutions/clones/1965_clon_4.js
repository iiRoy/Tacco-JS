const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const upperBound = parseInt(rawData[0]);

const valueStrings = rawData[1].split(' ');
const numericValues = valueStrings.map(Number);

const occurrenceTally = numericValues.reduce((accumulator, currentVal) => {
    accumulator[currentVal - 1]++;
    return accumulator;
}, Array.from({ length: upperBound }, () => 0));

for (const tallyEntry of occurrenceTally) {
    console.log(tallyEntry);
}
