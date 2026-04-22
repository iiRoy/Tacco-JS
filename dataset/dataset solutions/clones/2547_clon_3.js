const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputLines = rawInputData.trim().split('\n');

if (!inputLines || inputLines.length < 2) {
    console.error("Input error: Expected at least two lines of data.");
    process.exit(1);
}

const configTokens = inputLines[0].split(' ');

const windowLength = Number(configTokens[1]);

const elementSequence = inputLines[1].split(' ');

const sequenceLen = elementSequence.length;

const distinctArrangements = new Set();

for (let currentIndex = 0; currentIndex <= sequenceLen - windowLength; ++currentIndex) {
    const prefixSegment = elementSequence.slice(0, currentIndex);

    const currentWindow = elementSequence.slice(currentIndex, currentIndex + windowLength);

    const sortedWindow = [...currentWindow].sort((valA, valB) => valA > valB);

    const suffixSegment = elementSequence.slice(currentIndex + windowLength);

    const fullArrangement = [...prefixSegment, ...sortedWindow, ...suffixSegment];

    const arrangementKey = fullArrangement.join(',');

    distinctArrangements.add(arrangementKey);
}

console.log(distinctArrangements.size);