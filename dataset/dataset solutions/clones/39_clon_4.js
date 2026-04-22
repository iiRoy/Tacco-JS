function assessPrimality(numberCandidate) {
    if (numberCandidate < 2) return false;
    if (numberCandidate === 2 || numberCandidate === 3) return true;
    if (numberCandidate % 2 === 0 || numberCandidate % 3 === 0) return false;
    let currentFactor = 5;
    while (currentFactor * currentFactor <= numberCandidate) {
        if (numberCandidate % currentFactor === 0 || numberCandidate % (currentFactor + 2) === 0) {
            return false;
        }
        currentFactor += 6;
    }
    return true;
}

function calculatePrimeOccurrences(upperBoundary) {
    const sequence = Array.from({ length: upperBoundary - 1 }, (_, idx) => idx + 2);
    const countedPrimes = sequence.filter(assessPrimality);
    return countedPrimes.length;
}

const fileOperations = require('fs');
const standardInputStreamIdentifier = '/dev/stdin';
const textEncoding = 'utf8';
const rawInputContent = fileOperations.readFileSync(standardInputStreamIdentifier, textEncoding);
const numericalValue = parseInt(rawInputContent.trim(), 10);

console.log(calculatePrimeOccurrences(numericalValue));