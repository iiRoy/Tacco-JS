const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const arraySize = Number(rawInputLines.shift());
const numericElements = rawInputLines.shift().split(' ').map(Number);

const elementMapping = new Map();
numericElements.forEach((val, idx) => {
    elementMapping.set(idx + 1, val);
});

let matchedPairsCount = 0;

for (const [currentKey, currentValue] of elementMapping.entries()) {
    const xValue = currentKey;
    const yValue = currentValue;

    if (yValue < xValue && elementMapping.has(yValue) && elementMapping.get(yValue) === xValue) {
        matchedPairsCount++;
    }
}

console.log(matchedPairsCount);
