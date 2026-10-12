const fileSystem = require('fs');

function getOperationSign(value) {
    return value > 0 ? '+' : '-';
}

function buildRepeatedString(charToRepeat, count) {
    let segmentAccumulator = '';
    for (let k = 0; k < count; k++) {
        segmentAccumulator += charToRepeat;
    }
    return segmentAccumulator;
}

const stdinFileDescriptor = process.stdin.fd;
const inputSize = fileSystem.fstatSync(stdinFileDescriptor).size;
const inputBuffer = Buffer.alloc(inputSize);
const readBytesCount = fileSystem.readSync(stdinFileDescriptor, inputBuffer, 0, inputSize, 0);
const inputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

function processInputData() {
    const inputString = inputLines[0];
    let resultString = '';
    const stringLength = inputString.length;

    let previousCharCode = 0;
    const thresholdForDirectRepeat = 16;

    const characterCodeArray = new Array(stringLength);
    for (let charIndex = 0; charIndex < stringLength; charIndex++) {
        characterCodeArray[charIndex] = inputString.charCodeAt(charIndex);
    }

    for (let charIndex = 0; charIndex < stringLength; charIndex++) {
        const currentCharCode = characterCodeArray[charIndex];
        const rawDifference = currentCharCode - previousCharCode;

        const operationSign = getOperationSign(rawDifference);
        const absoluteDifference = Math.abs(rawDifference);

        if (absoluteDifference < thresholdForDirectRepeat) {
            resultString += buildRepeatedString(operationSign, absoluteDifference);
        } else {
            const squareRootValue = Math.floor(Math.sqrt(absoluteDifference));

            resultString += '>';
            resultString += buildRepeatedString('+', squareRootValue);
            resultString += '[<';
            resultString += buildRepeatedString(operationSign, squareRootValue);
            resultString += '>-]<';

            const remainingDifference = absoluteDifference - (squareRootValue * squareRootValue);
            resultString += buildRepeatedString(operationSign, remainingDifference);
        }
        resultString += '.';
        previousCharCode = currentCharCode;
    }

    console.log(resultString);
}

processInputData();
