const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const collectedInputLines = [];

function computeAdjustedDifference(operandB, operandA, adjustment) {
    const intermediateResult = operandB - operandA;
    return intermediateResult - adjustment;
}

function resolveGameWinner(finalDifference) {
    const isOdd = (finalDifference % 2) !== 0;
    if (isOdd) {
        return 'Alice';
    } else {
        return 'Borys';
    }
}

inputProcessor.on('line', (currentLineSegment) => {
    collectedInputLines.push(currentLineSegment);
});

inputProcessor.on('close', () => {
    const firstInputLine = collectedInputLines[0];
    const lineSegments = firstInputLine.split(' ');

    const valueA = parseInt(lineSegments[1], 10);
    const valueB = parseInt(lineSegments[2], 10);

    const adjustmentFactor = 1;

    const calculatedDifference = computeAdjustedDifference(valueB, valueA, adjustmentFactor);

    const winnerName = resolveGameWinner(calculatedDifference);
    console.log(winnerName);
});
