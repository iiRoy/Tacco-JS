const fileSystem = require('fs');
const dataSize = fileSystem.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(dataSize);
const readBytes = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);
const inputLines = dataBuffer.toString('utf8', 0, readBytes).split('\n');

function locateBoundary(sortedArr, value, findStrictlyGreater) {
    let lowIdx = 0;
    let highIdx = sortedArr.length - 1;
    let boundaryIdx = sortedArr.length;

    while (lowIdx <= highIdx) {
        const midIdx = Math.floor((lowIdx + highIdx) / 2);
        if (findStrictlyGreater ? sortedArr[midIdx] > value : sortedArr[midIdx] >= value) {
            boundaryIdx = midIdx;
            highIdx = midIdx - 1;
        } else {
            lowIdx = midIdx + 1;
        }
    }
    return boundaryIdx;
}

function generatePrimeSequence() {
    const limit = 50023;
    const sieveArray = new Array(limit + 1).fill(false);

    sieveArray[0] = true;
    sieveArray[1] = true;

    for (let factor = 2; factor * factor <= limit; factor++) {
        if (!sieveArray[factor]) {
            for (let multiple = factor * factor; multiple <= limit; multiple += factor) {
                sieveArray[multiple] = true;
            }
        }
    }

    const primeSequence = [];
    sieveArray.forEach((isNotPrime, number) => {
        if (number > 1 && !isNotPrime) {
            primeSequence.push(number);
        }
    });
    return primeSequence;
}

function processInputData() {
    const primeList = generatePrimeSequence();

    inputLines.slice(0, inputLines.length - 1).forEach(line => {
        const currentNumber = parseInt(line, 10);

        let lowerPrime = 0;
        let upperPrime = 0;

        const firstGreaterOrEqualIdx = locateBoundary(primeList, currentNumber, false);
        if (firstGreaterOrEqualIdx > 0) {
            lowerPrime = primeList[firstGreaterOrEqualIdx - 1];
        }

        const firstStrictlyGreaterIdx = locateBoundary(primeList, currentNumber, true);
        if (firstStrictlyGreaterIdx < primeList.length) {
            upperPrime = primeList[firstStrictlyGreaterIdx];
        }
        
        console.log(lowerPrime, upperPrime);
    });
}

processInputData();
