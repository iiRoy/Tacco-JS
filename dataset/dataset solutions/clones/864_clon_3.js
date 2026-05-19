const fileSystemModule = require('fs');

const standardInputFileDescriptor = process.stdin.fd;
const inputByteLength = fileSystemModule.fstatSync(standardInputFileDescriptor).size;
const dataBuffer = Buffer.alloc(inputByteLength);
const actualBytesReadCount = fileSystemModule.readSync(standardInputFileDescriptor, dataBuffer, 0, inputByteLength, 0);
const rawInputLines = dataBuffer.toString('utf8', 0, actualBytesReadCount).split('\n');

const upperBoundN = parseInt(rawInputLines[0], 10);

const firstCoordinatePairStr = rawInputLines[1].split(' ');
const coordA1 = parseInt(firstCoordinatePairStr[0], 10);
const coordA2 = parseInt(firstCoordinatePairStr[1], 10);

const secondCoordinatePairStr = rawInputLines[2].split(' ');
const coordB1 = parseInt(secondCoordinatePairStr[0], 10);
const coordB2 = parseInt(secondCoordinatePairStr[1], 10);

function calculateCustomDistance(valueOne, valueTwo, divisor) {
    const remainderValOne = valueOne % divisor;
    const remainderValTwo = valueTwo % divisor;
    const quotientValOne = Math.floor(valueOne / divisor);
    const quotientValTwo = Math.floor(valueTwo / divisor);

    const remainderDifference = Math.abs(remainderValOne - remainderValTwo);
    const quotientDifference = Math.abs(quotientValOne - quotientValTwo);

    return remainderDifference + quotientDifference;
}

let minimumCalculatedDistance = Infinity;

for (let currentIterationValue = 1; currentIterationValue <= upperBoundN; currentIterationValue++) {
    const distancePairA = calculateCustomDistance(coordA1, coordA2, currentIterationValue);
    const distancePairB = calculateCustomDistance(coordB1, coordB2, currentIterationValue);

    const currentTotalDistance = distancePairA + distancePairB;
    minimumCalculatedDistance = Math.min(minimumCalculatedDistance, currentTotalDistance);
}

console.log(minimumCalculatedDistance);
