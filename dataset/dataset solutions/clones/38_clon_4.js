const obtainPrimes = (limitValue) => {
    const primeStatusFlags = Array(limitValue + 1).fill(true);
    primeStatusFlags[0] = false;
    primeStatusFlags[1] = false;

    let currentCandidate = 2;
    const boundaryCheck = Math.floor(Math.sqrt(limitValue));

    while (currentCandidate <= boundaryCheck) {
        if (primeStatusFlags[currentCandidate]) {
            let compositeMarker = currentCandidate * currentCandidate;
            while (compositeMarker <= limitValue) {
                primeStatusFlags[compositeMarker] = false;
                compositeMarker += currentCandidate;
            }
        }
        currentCandidate++;
    }

    const compiledPrimes = [];
    let currentIdx = 0;
    while (currentIdx <= limitValue) {
        if (primeStatusFlags[currentIdx]) {
            compiledPrimes.push(currentIdx);
        }
        currentIdx++;
    }
    return compiledPrimes;
};

const locateUpperIndex = (orderedList, comparisonValue) => {
    let lowerBound = 0;
    let upperBound = orderedList.length;
    while (lowerBound < upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (orderedList[midPoint] <= comparisonValue) {
            lowerBound = midPoint + 1;
        } else {
            upperBound = midPoint;
        }
    }
    return lowerBound;
};

const MAXIMUM_PRIME = 999999;
const generatedPrimeList = obtainPrimes(MAXIMUM_PRIME);

const streamData = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericEntries = (streamData.trim()).split("\n").map(Number);

for (let entryIndex = 0; entryIndex < numericEntries.length; entryIndex++) {
    const queryNumber = numericEntries[entryIndex];
    const resultCount = locateUpperIndex(generatedPrimeList, queryNumber);
    console.log(resultCount);
}