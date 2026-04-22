const acquireData = require('node:fs').readFileSync;
const rawContent = acquireData(0, 'utf8');

const processedInputs = rawContent
    .split('\n')
    .map(line => {
        const candidateValue = parseInt(line.trim(), 10);
        if (candidateValue === 0 || isNaN(candidateValue)) {
            return null;
        }
        return candidateValue;
    })
    .filter(item => item !== null);

initiateProcessing();

function generateCumulativePrimeSums() {
    const upperBoundary = 10000;
    const isCandidatePrime = new Array(upperBoundary + 1).fill(true);

    isCandidatePrime[0] = false;
    isCandidatePrime[1] = false;

    for (let factor = 2; factor * factor <= upperBoundary; factor++) {
        if (isCandidatePrime[factor]) {
            for (let multiple = factor * factor; multiple <= upperBoundary; multiple += factor) {
                isCandidatePrime[multiple] = false;
            }
        }
    }

    const aggregatedSums = [];
    let currentAccumulation = 0;

    for (let currentNumber = 2; currentNumber <= upperBoundary; currentNumber++) {
        if (isCandidatePrime[currentNumber]) {
            currentAccumulation += currentNumber;
            aggregatedSums.push(currentAccumulation);
        }
    }

    return aggregatedSums;
}

function initiateProcessing() {
    const precalculatedSequence = generateCumulativePrimeSums();

    processedInputs.forEach(inputIndex => {
        console.log(precalculatedSequence[inputIndex]);
    });
}