function calculatePrimeCountUpTo(upperBound) {
    let totalPrimeCount = 0;

    for (let candidateNumber = 2; candidateNumber <= upperBound; ++candidateNumber) {
        let isCandidatePrime = true;

        for (let testDivisor = 2; testDivisor * testDivisor <= candidateNumber; ++testDivisor) {
            if (candidateNumber % testDivisor === 0) {
                isCandidatePrime = false;
                break;
            }
        }

        if (isCandidatePrime) {
            totalPrimeCount++;
        }
    }
    return totalPrimeCount;
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(calculatePrimeCountUpTo(Number.fileContent));
