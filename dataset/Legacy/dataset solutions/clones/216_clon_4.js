const fileSystem = require('fs');
const streamStats = fileSystem.fstatSync(process.stdin.fd);
const totalBytes = streamStats.size;
const dataBuffer = Buffer.alloc(totalBytes);
const actualBytesRead = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, totalBytes, 0);
const rawInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

processInputAndOutput();

function processInputAndOutput() {
    const cumulativePrimeSums = calculatePrimeSumsAlternative();

    rawInputLines.slice(0, rawInputLines.length - 1)
                 .map(Number)
                 .filter(val => !!val)
                 .forEach(idx => {
                     console.log(cumulativePrimeSums[idx]);
                 });
}

function* primeGenerator(upperBound) {
    const compositeTracker = new Array(upperBound + 1).fill(false);
    compositeTracker[0] = compositeTracker[1] = true;

    for (let candidate = 2; candidate <= upperBound; candidate++) {
        if (!compositeTracker[candidate]) {
            yield candidate;
            for (let multiple = candidate * candidate; multiple <= upperBound; multiple += candidate) {
                compositeTracker[multiple] = true;
            }
        }
    }
}

function calculatePrimeSumsAlternative() {
    const upperLimit = 10000;
    const sumAccumulator = [];
    let currentRunningTotal = 0;

    for (const currentPrime of primeGenerator(upperLimit)) {
        currentRunningTotal += currentPrime;
        sumAccumulator.push(currentRunningTotal);
    }
    
    return sumAccumulator;
}
