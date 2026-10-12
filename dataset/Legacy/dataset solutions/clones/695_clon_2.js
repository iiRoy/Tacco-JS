const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputBuffer = [];
let bufferPointer = 0;

inputReader.on('line', (currentLine) => {
    inputBuffer.push(currentLine);
});

inputReader.on('close', () => {
    performCoreProcessing();
});

function getNextInteger() {
    return parseInt(inputBuffer[bufferPointer++], 10);
}

function performCoreProcessing() {
    let itemCount;
    let operationCount;

    while (true) {
        itemCount = getNextInteger();

        let sequenceData = new Array(itemCount);

        for (let outerLoopIndex = 0; outerLoopIndex < itemCount; outerLoopIndex++) {
            sequenceData[outerLoopIndex] = itemCount - outerLoopIndex;
        }

        operationCount = getNextInteger();

        if (operationCount === 0 && itemCount === 0) {
            break;
        }

        for (let outerLoopIndex = 0; outerLoopIndex < operationCount; outerLoopIndex++) {
            let splitPoint = getNextInteger() - 1;
            let segmentLength = getNextInteger();

            let temporaryStorage = new Array(splitPoint);

            for (let innerLoopIndex = 0; innerLoopIndex < splitPoint; innerLoopIndex++) {
                temporaryStorage[innerLoopIndex] = sequenceData[innerLoopIndex];
            }

            for (let innerLoopIndex = 0; innerLoopIndex < segmentLength; innerLoopIndex++) {
                sequenceData[innerLoopIndex] = sequenceData[innerLoopIndex + splitPoint];
            }

            for (let innerLoopIndex = 0; innerLoopIndex < splitPoint; innerLoopIndex++) {
                sequenceData[innerLoopIndex + segmentLength] = temporaryStorage[innerLoopIndex];
            }
        }

        console.log(sequenceData[0]);
    }
}
