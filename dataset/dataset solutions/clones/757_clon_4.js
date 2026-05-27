const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawInput.trim().split("\n");

let lineIndex = 0;

for (;;) {
    const currentLineCountStr = lineSegments[lineIndex];
    lineIndex++;

    const numericCount = Number(currentLineCountStr);

    if (numericCount === 0) {
        break;
    }

    const numberSequenceStr = lineSegments[lineIndex];
    lineIndex++;

    const currentNumbers = numberSequenceStr.split(" ").map(val => Number(val));

    const sortedValues = currentNumbers.sort((valA, valB) => valA - valB);

    const minimumAdjacentDifference = sortedValues.slice(1)
        .map((currentVal, prevIndex) => currentVal - sortedValues[prevIndex])
        .reduce((currentMin, diffVal) => Math.min(currentMin, diffVal), Infinity);

    console.log(minimumAdjacentDifference);
}
