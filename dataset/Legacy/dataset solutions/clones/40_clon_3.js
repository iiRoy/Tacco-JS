const fileSystemModule = require('fs');

function calculatePrimesCountUpToSqrt(targetNumber) {
    if (targetNumber === 1) {
        return 0;
    }
    if (targetNumber === 2) {
        return 1;
    }

    const limitSqrt = Math.sqrt(targetNumber);
    let primeList = [2];
    let currentPrimeCount = 1;

    for (let candidate = 3; candidate < limitSqrt; candidate += 1) {
        let isCandidatePrime = true;
        for (const primeDivisor of primeList) {
            if (primeDivisor > limitSqrt) {
                break;
            }
            if (candidate % primeDivisor === 0) {
                isCandidatePrime = false;
                break;
            }
        }
        if (isCandidatePrime) {
            primeList.push(candidate);
            currentPrimeCount++;
        }
    }
    return currentPrimeCount;
}

function processInputData() {
    const fileDescriptor = process.stdin.fd;
    const fileSize = fileSystemModule.fstatSync(fileDescriptor).size;
    const dataBuffer = Buffer.alloc(fileSize);
    const actualBytesRead = fileSystemModule.readSync(fileDescriptor, dataBuffer, 0, fileSize, 0);
    const rawInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

    const parsedNumbers = new Int32Array(rawInputLines);

    const totalNumbers = parsedNumbers.length;
    let primeCountResult;
    
    for (let idx = 0; idx < totalNumbers; ++idx) {
        const currentNumber = parsedNumbers[idx];
        primeCountResult = calculatePrimesCountUpToSqrt(currentNumber);
        console.log(primeCountResult);
    }
}

processInputData();
