const applicationSettings = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

if (process.platform === 'win32') {
    applicationSettings.lineDelimiter = '\r\n';
    applicationSettings.sourcePath = 'input.txt';
}

const ASCII_CODE_ZERO = 0x30;
const ASCII_CODE_NINE = 0x39;
const LINE_FEED_BYTE_CODE = 0x0a;
const CARRIAGE_RETURN_BYTE_CODE = 0x0d;

let currentNumericValue = 0;
let isCurrentlyParsingNumber = false;
let collectedNumbers = [];

const dataInputPipe = require('fs').createReadStream(applicationSettings.sourcePath, { encoding: null });

dataInputPipe.on('readable', function() {
    let incomingDataChunk;

    while ((incomingDataChunk = dataInputPipe.read()) !== null) {
        if (incomingDataChunk.length === 0) {
            continue;
        }

        for (let byteIdx = 0; byteIdx < incomingDataChunk.length; byteIdx++) {
            const currentByte = incomingDataChunk[byteIdx];

            if (currentByte >= ASCII_CODE_ZERO && currentByte <= ASCII_CODE_NINE) {
                currentNumericValue = currentNumericValue * 10 + (currentByte - ASCII_CODE_ZERO);
                isCurrentlyParsingNumber = true;
            } else {
                if (isCurrentlyParsingNumber) {
                    collectedNumbers.push(currentNumericValue);
                    currentNumericValue = 0;
                    isCurrentlyParsingNumber = false;
                }
            }
        }
    }
});

dataInputPipe.on('end', function() {
    if (isCurrentlyParsingNumber) {
        collectedNumbers.push(currentNumericValue);
    }

    if (collectedNumbers.length === 0) {
        console.warn("Input stream contained no parseable numbers. Exiting.");
        return;
    }

    const workingDataSetCopy = Array.from(collectedNumbers);

    const totalInversionsFound = calculateInversionsAndSort(collectedNumbers, workingDataSetCopy, 0, collectedNumbers.length);
    console.log(totalInversionsFound);
});

function calculateInversionsAndSort(mainDataStore, workingBuffer, segmentStartIdx, segmentEndIdx) {
    if (segmentEndIdx - segmentStartIdx <= 1) {
        return 0;
    }

    if (segmentEndIdx - segmentStartIdx === 2) {
        if (mainDataStore[segmentStartIdx] > mainDataStore[segmentStartIdx + 1]) {
            [mainDataStore[segmentStartIdx], mainDataStore[segmentStartIdx + 1]] =
            [mainDataStore[segmentStartIdx + 1], mainDataStore[segmentStartIdx]];
            return 1;
        }
        return 0;
    }

    let totalInversions = 0;
    const midpointIdx = Math.floor((segmentStartIdx + segmentEndIdx) / 2);

    totalInversions += calculateInversionsAndSort(workingBuffer, mainDataStore, segmentStartIdx, midpointIdx);
    totalInversions += calculateInversionsAndSort(workingBuffer, mainDataStore, midpointIdx, segmentEndIdx);

    let leftPtr = segmentStartIdx;
    let rightPtr = midpointIdx;

    for (let mergeTargetIdx = segmentStartIdx; mergeTargetIdx < segmentEndIdx; mergeTargetIdx++) {
        if (leftPtr === midpointIdx) {
            mainDataStore[mergeTargetIdx] = workingBuffer[rightPtr++];
        } else if (rightPtr === segmentEndIdx) {
            mainDataStore[mergeTargetIdx] = workingBuffer[leftPtr++];
        } else if (workingBuffer[leftPtr] < workingBuffer[rightPtr]) {
            mainDataStore[mergeTargetIdx] = workingBuffer[leftPtr++];
        } else {
            mainDataStore[mergeTargetIdx] = workingBuffer[rightPtr++];
            totalInversions += (midpointIdx - leftPtr);
        }
    }
    return totalInversions;
}