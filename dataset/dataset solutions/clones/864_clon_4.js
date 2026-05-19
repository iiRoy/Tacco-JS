const fileSys = require('fs');
const dataSize = fileSys.fstatSync(process.stdin.fd).size;
const inputBuffer = new Buffer(dataSize);
const readBytesCount = fileSys.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);
const lineData = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

const upperBound = Number(lineData[0]);
const [valA, valB] = lineData[1].split(' ').map(Number);
const [valC, valD] = lineData[2].split(' ').map(Number);

const computePairwiseDistance = (firstOperand, secondOperand, currentDivisor) => {
    const remainderDifference = Math.abs(firstOperand % currentDivisor - secondOperand % currentDivisor);
    const quotientDifference = Math.abs(Math.floor(firstOperand / currentDivisor) - Math.floor(secondOperand / currentDivisor));
    return remainderDifference + quotientDifference;
};

const overallMinimum = Array.from({ length: upperBound }, (_, index) => index + 1)
    .reduce((currentMinimum, currentDivisor) => {
        const pairOneMetric = computePairwiseDistance(valA, valB, currentDivisor);
        const pairTwoMetric = computePairwiseDistance(valC, valD, currentDivisor);
        return Math.min(currentMinimum, pairOneMetric + pairTwoMetric);
    }, Infinity);

console.log(overallMinimum);
