const fileSystem = require('fs');

const getPrimeStatus = (numValue) => {
    if (numValue < 2) return false;
    if (numValue === 2 || numValue === 3) return true;
    if (numValue % 2 === 0 || numValue % 3 === 0) return false;
    for (let currentDivisor = 5; currentDivisor * currentDivisor <= numValue; currentDivisor += 6) {
        if (numValue % currentDivisor === 0 || numValue % (currentDivisor + 2) === 0) return false;
    }
    return true;
};

const isTargetPair = (candidateNumber) => {
    if (candidateNumber < 1) return false;
    if (candidateNumber === 1 || candidateNumber === 2 || candidateNumber === 3) return true;

    if (!getPrimeStatus(candidateNumber)) return false;

    const halfPlusOne = (candidateNumber + 1) / 2;
    if (halfPlusOne !== Math.floor(halfPlusOne)) return false;

    return getPrimeStatus(halfPlusOne);
};

const processInput = (inputContent) => {
    const inputLines = inputContent.trim().split('\n');
    let lineIndex = 0;

    const queryCount = Number(inputLines[lineIndex++]);
    const queryRanges = [];
    for (let qIdx = 0; qIdx < queryCount; qIdx++) {
        queryRanges.push(inputLines[lineIndex++].split(' ').map(Number));
    }

    const maximumR = queryRanges.reduce((currentMax, [, rVal]) => Math.max(currentMax, rVal), 0);

    const prefixSums = new Uint32Array(maximumR + 1);
    prefixSums[0] = 0;
    for (let currentNum = 1; currentNum <= maximumR; currentNum++) {
        prefixSums[currentNum] = prefixSums[currentNum - 1] + (isTargetPair(currentNum) ? 1 : 0);
    }

    queryRanges.forEach(([leftBound, rightBound]) => {
        if (leftBound === rightBound) {
            console.log(1);
        } else {
            console.log(prefixSums[rightBound - 1] - prefixSums[leftBound - 1]);
        }
    });
};

let allInputData = '';
process.stdin.on('data', (chunk) => {
    allInputData += chunk.toString();
});

process.stdin.on('end', () => {
    processInput(allInputData);
});
