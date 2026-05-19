const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync(process.stdin.fd, 'utf8');
const lineSegments = rawInputContent.split('\n');

const processInputValues = (inputLines) => {
    const parseAndNormalize = (lineString) => {
        const numericalRepresentation = Number(lineString);
        return isNaN(numericalRepresentation) ? 0 : numericalRepresentation;
    };

    const calculateSpecificPrimeCount = (targetNumber) => {
        if (targetNumber === 1) {
            return 0;
        }
        if (targetNumber < 2) {
            return 1;
        }

        const upperLimit = Math.sqrt(targetNumber);

        const recurseForPrimes = (currentCandidate, accumulatedPrimes, currentCount) => {
            if (currentCandidate >= upperLimit) {
                return currentCount;
            }

            const isCandidatePrime = !accumulatedPrimes.some(knownDivisor =>
                knownDivisor <= upperLimit && currentCandidate % knownDivisor === 0
            );

            if (isCandidatePrime) {
                return recurseForPrimes(currentCandidate + 1, accumulatedPrimes.concat(currentCandidate), currentCount + 1);
            } else {
                return recurseForPrimes(currentCandidate + 1, accumulatedPrimes, currentCount);
            }
        };

        return recurseForPrimes(3, [2], 1);
    };

    inputLines.map(parseAndNormalize).forEach(value => {
        console.log(calculateSpecificPrimeCount(value));
    });
};

processInputValues(lineSegments);
