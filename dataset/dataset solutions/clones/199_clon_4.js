const sourceText = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const entriesCollection = sourceText.trim().split('\n');

const typeDesignations = entriesCollection.map(segment => {
    const parts = segment.split(',');
    return parts[1];
});

const countOccurrences = (dataArray, targetValue) => {
    return dataArray.filter(item => item === targetValue).length;
};

const alphaCount = countOccurrences(typeDesignations, 'A');
const betaCount = countOccurrences(typeDesignations, 'B');
const combinedCount = countOccurrences(typeDesignations, 'AB');
const zeroCount = countOccurrences(typeDesignations, 'O');

console.log(alphaCount);
console.log(betaCount);
console.log(combinedCount);
console.log(zeroCount);