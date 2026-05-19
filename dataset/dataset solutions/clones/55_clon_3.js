const fileSystemModule = require('fs');

function readStandardInputLines() {
    const fileDescriptor = process.stdin.fd;
    const inputBufferLength = fileSystemModule.fstatSync(fileDescriptor).size;
    const dataBuffer = Buffer.alloc(inputBufferLength);
    const actualBytesRead = fileSystemModule.readSync(fileDescriptor, dataBuffer, 0, inputBufferLength, 0);
    const rawContent = dataBuffer.toString('utf8', 0, actualBytesRead);
    const trimmedContent = rawContent.trim();
    return trimmedContent.split('\n');
}

const rawInputLines = readStandardInputLines();

function processQueueOperations() {
    const operationStack = [];
    const zeroValueIndicator = 0;

    const performPush = (valueToPush) => {
        operationStack.push(valueToPush);
    };

    const performPopAndLog = () => {
        const poppedElement = operationStack.pop();
        console.log(poppedElement);
    };

    for (let lineIndex = 0; lineIndex < rawInputLines.length; ++lineIndex) {
        const currentLineString = rawInputLines[lineIndex];
        const currentNumericValue = Number(currentLineString);

        if (currentNumericValue !== zeroValueIndicator) {
            performPush(currentNumericValue);
        } else {
            performPopAndLog();
        }
    }
}

processQueueOperations();
