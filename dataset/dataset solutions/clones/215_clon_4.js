function isPrimalityCheck(value) {
    if (value <= 1) return false;
    if (value <= 3) return true;
    if (value % 2 === 0 || value % 3 === 0) return false;
    for (let currentDivisor = 5; currentDivisor * currentDivisor <= value; currentDivisor += 6) {
        if (value % currentDivisor === 0 || value % (currentDivisor + 2) === 0) {
            return false;
        }
    }
    return true;
}

class PrimeSequenceProvider {
    constructor() {
        this.knownPrimes = [-1, 2, 3, 5, 7, 11, 13];
        this.lastCheckedNumber = 13; 
    }

    retrieveNthPrime(index) {
        if (index < this.knownPrimes.length) {
            return this.knownPrimes[index];
        }

        let candidateForPrimality = this.lastCheckedNumber + 2;
        if (candidateForPrimality % 2 === 0) {
             candidateForPrimality++;
        }

        while (this.knownPrimes.length <= index) {
            if (isPrimalityCheck(candidateForPrimality)) {
                this.knownPrimes.push(candidateForPrimality);
            }
            candidateForPrimality += 2;
        }
        this.lastCheckedNumber = candidateForPrimality - 2;
        return this.knownPrimes[index];
    }
}

const sourceOfNumericalData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = sourceOfNumericalData.split('\n').filter(lineContent => lineContent.trim() !== '');

const primeNumberSource = new PrimeSequenceProvider();

let calculatedResults = [];
for (const currentDataRow of dataRows) {
    const parsedNumericValue = Number.parseInt(currentDataRow, 10);

    if (parsedNumericValue === 0) {
        break;
    }

    let totalAccumulation = 0;
    let iterationCount = parsedNumericValue;

    while (iterationCount > 0) {
        totalAccumulation += primeNumberSource.retrieveNthPrime(iterationCount);
        iterationCount--;
    }
    calculatedResults.push(totalAccumulation);
}

calculatedResults.forEach(finalValue => console.log(finalValue));