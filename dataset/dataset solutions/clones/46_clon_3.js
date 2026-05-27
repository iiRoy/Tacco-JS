process.stdin.resume();
process.stdin.setEncoding('utf8');

function extractAndAdjustIndices(lineString) {
    const delimiterCharacter = ',';
    const parts = lineString.split(delimiterCharacter);
    const firstAdjustedIndex = parseInt(parts[0], 10) - 1;
    const secondAdjustedIndex = parseInt(parts[1], 10) - 1;
    return { firstAdjustedIndex, secondAdjustedIndex };
}

function swapElementsInArray(targetArray, positionA, positionB) {
    const temporaryHolder = targetArray[positionA];
    targetArray[positionA] = targetArray[positionB];
    targetArray[positionB] = temporaryHolder;
}

process.stdin.on('data', function(receivedChunk) {
    processInputData(receivedChunk.trim());
});

function processInputData(cleanedInput) {
    const allInputLines = cleanedInput.split("\n");

    const initialArraySize = parseInt(allInputLines[0], 10);
    const totalSwapOperations = parseInt(allInputLines[1], 10);

    const resultingSequence = [];
    let currentNumberToPush = 1;
    while (currentNumberToPush <= initialArraySize) {
        resultingSequence.push(currentNumberToPush);
        currentNumberToPush++;
    }

    let currentLinePointer = 2;
    for (let operationCounter = 0; operationCounter < totalSwapOperations; operationCounter++) {
        const { firstAdjustedIndex, secondAdjustedIndex } = extractAndAdjustIndices(allInputLines[currentLinePointer]);
        swapElementsInArray(resultingSequence, firstAdjustedIndex, secondAdjustedIndex);
        currentLinePointer++;
    }

    for (let outputPosition = 0; outputPosition < initialArraySize; outputPosition++) {
        console.log(resultingSequence[outputPosition]);
    }
}
