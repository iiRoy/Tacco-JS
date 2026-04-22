let entireInputAccumulator = '';

process.stdin.on('data', inputChunk => {
    entireInputAccumulator += inputChunk.toString();
});

process.stdin.on('end', () => {
    const processedLines = entireInputAccumulator.trim().split('\n');
    processInputCollection(processedLines);
});

function processInputCollection(sourceDataSegments) {
    sourceDataSegments.forEach(segmentEntry => {
        const numericValue = Number(segmentEntry);
        if (numericValue !== 0) {
            const optimalResult = determineMinimalCombinationSum(numericValue);
            process.stdout.write(optimalResult.toString() + '\n');
        }
    });
}

function determineMinimalCombinationSum(targetNumberGoal) {
    const potentialCValues = Array.from({ length: Math.floor(Math.cbrt(targetNumberGoal)) + 1 }, (_, cubeIndex) => cubeIndex);

    const allComputedSums = potentialCValues.flatMap(currentCValue => {
        const remainderForSquares = targetNumberGoal - currentCValue * currentCValue * currentCValue;
        if (remainderForSquares < 0) {
            return [];
        }

        const potentialBValues = Array.from({ length: Math.floor(Math.sqrt(remainderForSquares)) + 1 }, (_, squareIndex) => squareIndex);

        return potentialBValues.map(currentBValue => {
            const derivedAValue = remainderForSquares - currentBValue * currentBValue;
            return derivedAValue + currentBValue + currentCValue;
        });
    });

    return allComputedSums.reduce((currentMin, nextSum) => Math.min(currentMin, nextSum), targetNumberGoal);
}