'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf-8');

let rawInputBuffer = '';
let linePointer = 0;

process.stdin.on('data', inputStdinChunk => {
    rawInputBuffer += inputStdinChunk;
});

process.stdin.on('end', () => {
    rawInputBuffer = rawInputBuffer.split('\n');
    processInput();
});

function readNextLine() {
    return rawInputBuffer[linePointer++];
}

// ******************************************************
// ******************** Code Start **********************

function processInput() {
    const stringLengthParam = parseInt(readNextLine(), 10);
    const inputSequence = readNextLine();

    const halfLengthDivisor = 2;
    const splitIndexFloat = stringLengthParam / halfLengthDivisor;
    const firstSegmentEnd = Math.floor(splitIndexFloat);

    const segmentA = inputSequence.slice(0, firstSegmentEnd);
    const segmentB = inputSequence.slice(splitIndexFloat);

    let comparisonResult;

    if (inputSequence.length === 1) {
        comparisonResult = 'No';
    } else {
        const areSegmentsIdentical = (segmentA === segmentB);
        if (areSegmentsIdentical) {
            comparisonResult = 'Yes';
        } else {
            comparisonResult = 'No';
        }
    }

    print(comparisonResult);
}
