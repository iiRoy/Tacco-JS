const FILE_SOURCE_PATH = '/dev/stdin';
const fileSystemModule = require('fs');
let rawInputContent = fileSystemModule.readFileSync(FILE_SOURCE_PATH, 'utf8');

rawInputContent = rawInputContent.trim();
let currentNumberForFactoring = parseInt(rawInputContent);

const initialNumberSnapshot = currentNumberForFactoring;

const collectedPrimeFactors = [];

let currentDivisorCandidate = 2;

while (currentDivisorCandidate <= currentNumberForFactoring / 2) {
    let currentRemainder = currentNumberForFactoring % currentDivisorCandidate;

    while (currentRemainder === 0) {
        collectedPrimeFactors.push(currentDivisorCandidate);
        currentNumberForFactoring /= currentDivisorCandidate;
        currentRemainder = currentNumberForFactoring % currentDivisorCandidate;
    }
    currentDivisorCandidate++;
}

console.log(initialNumberSnapshot + ': ' + collectedPrimeFactors.join(' '));
