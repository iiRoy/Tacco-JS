'use strict';

function createInputProcessor() {
    let receivedDataBuffer = '';
    let currentLineIndex = 0;
    let cachedProcessedLines = [];

    process.stdin.on('data', dataChunk => {
        receivedDataBuffer += dataChunk;
    });

    return new Promise(completionHandler => {
        process.stdin.on('end', () => {
            cachedProcessedLines = receivedDataBuffer.trim().split('\n').map(lineContent => lineContent.trim());
            completionHandler({
                retrieveNextInputLine: () => cachedProcessedLines[currentLineIndex++],
                parseLineToNumberArray: (textLine) => textLine.split(' ').map(Number),
                parseLineToSingleNumber: (textLine) => Number(textLine)
            });
        });
    });
}

function calculateMinimumFrogCost(inputAccessor) {
    const problemParameters = inputAccessor.parseLineToNumberArray(inputAccessor.retrieveNextInputLine());
    const totalSequenceLength = problemParameters[0];
    const maximumAllowedJump = problemParameters[1];
    const heightValues = inputAccessor.parseLineToNumberArray(inputAccessor.retrieveNextInputLine());

    const costCache = new Map();

    function determinePathCost(targetIndex) {
        if (targetIndex === 0) {
            return 0;
        }
        if (targetIndex === 1) {
            return Math.abs(heightValues[1] - heightValues[0]);
        }
        if (costCache.has(targetIndex)) {
            return costCache.get(targetIndex);
        }

        let lowestAchievableCost = Infinity;

        for (let backwardStep = 1; backwardStep <= maximumAllowedJump; backwardStep++) {
            const sourceIndex = targetIndex - backwardStep;
            if (sourceIndex >= 0) {
                const costFromSource = determinePathCost(sourceIndex) + Math.abs(heightValues[targetIndex] - heightValues[sourceIndex]);
                lowestAchievableCost = Math.min(lowestAchievableCost, costFromSource);
            }
        }

        costCache.set(targetIndex, lowestAchievableCost);
        return lowestAchievableCost;
    }

    console.log(determinePathCost(totalSequenceLength - 1));
}

process.stdin.resume();
process.stdin.setEncoding('utf-8');

createInputProcessor().then(processorInstance => {
    calculateMinimumFrogCost(processorInstance);
});
