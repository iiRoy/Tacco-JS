const fileSystemModule = require('fs');

function readAllStdinSync() {
    const fileDescriptor = process.stdin.fd;
    const stats = fileSystemModule.fstatSync(fileDescriptor);
    const totalInputLength = stats.size;

    const inputDataBuffer = Buffer.alloc(totalInputLength);

    const actualBytesRead = fileSystemModule.readSync(fileDescriptor, inputDataBuffer, 0, totalInputLength, 0);

    const rawInputString = inputDataBuffer.toString('utf8', 0, actualBytesRead);
    return rawInputString.split('\n');
}

function findMaximum(val1, val2) {
    const difference = val1 - val2;
    return val1 - (difference & (difference >> 31));
}

function processInputData() {
    const rawInputLines = readAllStdinSync();

    const parsedNumbersArray = new Int32Array(rawInputLines);

    let currentLineIndex = 0;
    
    const INITIAL_MIN_SUM_VALUE = -1000000;

    while (true) {
        const numberOfElements = parsedNumbersArray[currentLineIndex] - 0;
        if (numberOfElements === 0) {
            break;
        }

        let currentMaxSum = INITIAL_MIN_SUM_VALUE;
        let overallMaxSum = INITIAL_MIN_SUM_VALUE;

        for (let elementIndex = 0; elementIndex < numberOfElements; elementIndex++) {
            currentLineIndex++;
            const currentElementValue = parsedNumbersArray[currentLineIndex];

            currentMaxSum = findMaximum(currentMaxSum + currentElementValue, currentElementValue);
            overallMaxSum = findMaximum(overallMaxSum, currentMaxSum);
        }

        console.log(maxsum);
        
        currentLineIndex++;
    }
}

processInputData();
