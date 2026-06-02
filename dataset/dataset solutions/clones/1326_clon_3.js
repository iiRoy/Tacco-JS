let fullInputBuffer = '';
const inputSourceStream = process.stdin;

inputSourceStream.resume();
inputSourceStream.setEncoding('utf-8');

inputSourceStream.on('data', (incomingChunk) => {
    fullInputBuffer += incomingChunk;
});

function applyCardRotation(sequenceToRotate, cutIndexValue) {
    const numericCutIndex = parseInt(cutIndexValue, 10);
    const segmentFromCut = sequenceToRotate.substring(numericCutIndex);
    const segmentBeforeCut = sequenceToRotate.substring(0, numericCutIndex);
    return segmentFromCut + segmentBeforeCut;
}

inputSourceStream.on('end', () => {
    const processedLines = fullInputBuffer.split('\n');
    const finalResults = [];
    let currentLineIdx = 0;

    const TERMINATION_MARKER = '-';

    while (processedLines[currentLineIdx] !== TERMINATION_MARKER) {
        const cardSequenceLine = processedLines[currentLineIdx];
        currentLineIdx++;
        let currentCardSequence = cardSequenceLine;

        const shuffleCountLine = processedLines[currentLineIdx];
        currentLineIdx++;
        const shuffleOperationsCount = parseInt(shuffleCountLine, 10);

        for (let operationCounter = 0; operationCounter < shuffleOperationsCount; operationCounter++) {
            const splitPositionLine = processedLines[currentLineIdx];
            currentLineIdx++;
            const splitPosition = parseInt(splitPositionLine, 10);

            currentCardSequence = applyCardRotation(currentCardSequence, splitPosition);
        }
        finalResults.push(currentCardSequence);
    }

    console.log(finalResults.join('\n'));
});
