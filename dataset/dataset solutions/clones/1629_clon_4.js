const streamProcessor = (callbackFunction) => {
    let collectedData = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (incomingSegment) => {
        collectedData += incomingSegment;
    });

    process.stdin.on('end', () => {
        callbackFunction(collectedData);
    });
};

const analyzeSequenceForMoves = (sequenceString, currentLeftPointer, currentRightPointer, currentMoveTally) => {
    if (currentLeftPointer >= currentRightPointer) {
        return currentMoveTally;
    }

    const rightwardSymbol = 'R';
    const leftwardSymbol = 'W';

    const locateLeftmostMismatch = (scanPosition) => {
        if (scanPosition >= currentRightPointer) {
            return -1;
        }
        if (sequenceString[scanPosition] === leftwardSymbol) {
            return scanPosition;
        }
        return locateLeftmostMismatch(scanPosition + 1);
    };

    const locateRightmostMismatch = (scanPosition, minimumLimit) => {
        if (scanPosition <= minimumLimit) {
            return -1;
        }
        if (sequenceString[scanPosition] === rightwardSymbol) {
            return scanPosition;
        }
        return locateRightmostMismatch(scanPosition - 1, minimumLimit);
    };

    const firstLeftMismatchIndex = locateLeftmostMismatch(currentLeftPointer);

    if (firstLeftMismatchIndex === -1) {
        return currentMoveTally;
    }

    const firstRightMismatchIndex = locateRightmostMismatch(currentRightPointer, firstLeftMismatchIndex);

    if (firstRightMismatchIndex === -1) {
        return currentMoveTally;
    }

    return analyzeSequenceForMoves(
        sequenceString,
        firstLeftMismatchIndex + 1,
        firstRightMismatchIndex - 1,
        currentMoveTally + 1
    );
};

const orchestrateProcessing = (fullInputContent) => {
    const lines = fullInputContent.trim().split('\n').map(line => line.trim());
    const charData = lines[1];

    const finalCount = analyzeSequenceForMoves(charData, 0, charData.length - 1, 0);
    console.log(finalCount);
};

streamProcessor(orchestrateProcessing);