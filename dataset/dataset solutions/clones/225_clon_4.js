function isNumberPrime(numeral) {
    if (numeral <= 1) return false;
    if (numeral <= 3) return true;
    if (numeral % 2 === 0 || numeral % 3 === 0) return false;

    for (let currentDivisor = 5; currentDivisor * currentDivisor <= numeral; currentDivisor += 6) {
        if (numeral % currentDivisor === 0 || numeral % (currentDivisor + 2) === 0) {
            return false;
        }
    }
    return true;
}

function retrievePrimes(ceilingValue) {
    const collectedPrimes = [];
    for (let k = 2; k <= ceilingValue; k++) {
        if (isNumberPrime(k)) {
            collectedPrimes.push(k);
        }
    }
    return collectedPrimes;
}

const calculatedPrimes = retrievePrimes(50000);
const primeLookup = new Set(calculatedPrimes);

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericQueries = rawData.trim().split('\n').map(Number);

let queryIndex = 0;
while (true) {
    const currentQuery = numericQueries[queryIndex++];
    if (currentQuery === 0) {
        break;
    }

    let pairCounter = 0;
    for (const firstTerm of calculatedPrimes) {
        if (firstTerm >= currentQuery) {
            break;
        }

        const secondTerm = currentQuery - firstTerm;

        if (secondTerm < firstTerm) {
            continue;
        }

        if (primeLookup.has(secondTerm)) {
            pairCounter++;
        }
    }
    console.log(pairCounter);
}