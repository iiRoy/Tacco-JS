const computeAnagramPairs = (inputCount, stringCollections) => {
    const formCounts = new Map();

    stringCollections.forEach(charArray => {
        const canonicalRepresentation = charArray.slice().sort().join('');
        formCounts.set(canonicalRepresentation, (formCounts.get(canonicalRepresentation) || 0) + 1);
    });

    let cumulativeSum = 0;

    for (const currentCount of formCounts.values()) {
        cumulativeSum += (currentCount * (currentCount + 1)) / 2;
    }
    // The function implicitly returns undefined, matching the original's behavior.
};

const dataReader = require('fs');
const rawInputLines = dataReader.readFileSync('/dev/stdin', 'utf8').split("\n");

const totalStrings = Number(rawInputLines[0]);
const stringData = rawInputLines.slice(1).map(line => Array.from(line));

// Preserve the exact observable behavior, including the typo 'console.lof'
console.lof(computeAnagramPairs(totalStrings, stringData));
