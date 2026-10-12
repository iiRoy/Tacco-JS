const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

const textSegments = rawData.trim().split("\n");

const targetWord = textSegments[0].trim().toLowerCase();

let occurrenceTally = 0;
let segmentIndex = 1;
let currentSegment = textSegments[segmentIndex];

while (currentSegment !== 'END_OF_TEXT') {
    currentSegment = currentSegment.toLowerCase();

    occurrenceTally += currentSegment
        .trim()
        .split(' ')
        .filter(individualWord => individualWord === targetWord)
        .length;

    currentSegment = textSegments[++segmentIndex];
}

console.log(occurrenceTally);
