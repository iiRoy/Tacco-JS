process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputChunk) {
    processInput(inputChunk.trim());
});

function processInput(fullInput) {
    const allInputLines = fullInput.split('\n');

    const sequenceLength = Number(allInputLines[0]);
    const swapOperationCount = Number(allInputLines[1]);

    const initialArrangement = Array.from({ length: sequenceLength }, (_, index) => index + 1);

    const swapInstructions = allInputLines.slice(2, 2 + swapOperationCount);

    const finalArrangement = swapInstructions.reduce((currentArrangement, instructionLine) => {
        const [firstPosStr, secondPosStr] = instructionLine.split(',');
        const zeroIndexedFirstPos = Number(firstPosStr) - 1;
        const zeroIndexedSecondPos = Number(secondPosStr) - 1;

        const nextArrangementState = [...currentArrangement];

        const temporaryValue = nextArrangementState[zeroIndexedFirstPos];
        nextArrangementState[zeroIndexedFirstPos] = nextArrangementState[zeroIndexedSecondPos];
        nextArrangementState[zeroIndexedSecondPos] = temporaryValue;

        return nextArrangementState;
    }, initialArrangement);

    console.log(finalArrangement.join('\n'));
}
