const displayOutcome = console.log;

class DataStreamAggregator {
    constructor(finalProcessingRoutine) {
        this.accumulatedContent = '';
        this.processingCallback = finalProcessingRoutine;

        if (typeof process !== "undefined" && process.stdin) {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            process.stdin.on('data', (incomingChunk) => {
                this.accumulatedContent += incomingChunk;
            });

            process.stdin.on('end', () => {
                const segmentedLines = this.accumulatedContent.split('\n');
                this.processingCallback(segmentedLines);
            });
        }
    }
}

function purifyText(rawTextValue) {
    return rawTextValue.replace(/[^a-z]/g, '');
}

function computeMatchScore(textA, textB) {
    const cachedResults = new Map();

    function retrieveCachedOrCalculate(rowPosition, columnPosition) {
        if (rowPosition < 0 || columnPosition < 0) {
            return 0;
        }

        const cacheKeyIdentifier = `${rowPosition}-${columnPosition}`;
        if (cachedResults.has(cacheKeyIdentifier)) {
            return cachedResults.get(cacheKeyIdentifier);
        }

        const characterMatchValue = (textA[rowPosition] === textB[columnPosition] ? 1 : 0);
        let currentCellScore;

        if (rowPosition === 0 && columnPosition === 0) {
            currentCellScore = characterMatchValue;
        } else if (rowPosition === 0) {
            const previousColumnScore = retrieveCachedOrCalculate(rowPosition, columnPosition - 1);
            currentCellScore = Math.max(previousColumnScore, characterMatchValue);
        } else if (columnPosition === 0) {
            const previousRowScore = retrieveCachedOrCalculate(rowPosition - 1, columnPosition);
            currentCellScore = Math.max(previousRowScore, characterMatchValue);
        } else {
            const scoreFromAboveCell = retrieveCachedOrCalculate(rowPosition - 1, columnPosition);
            const scoreFromLeftCell = retrieveCachedOrCalculate(rowPosition, columnPosition - 1);

            const intermediateCombinedValue = Math.max(scoreFromAboveCell, scoreFromLeftCell) + characterMatchValue;
            const indexBasedLimit = Math.min(rowPosition, columnPosition) + 1;

            currentCellScore = Math.min(intermediateCombinedValue, indexBasedLimit);
        }

        cachedResults.set(cacheKeyIdentifier, currentCellScore);
        return currentCellScore;
    }

    return retrieveCachedOrCalculate(textA.length - 1, textB.length - 1);
}

function coordinateProcessingRecursively(allInputLines, startFromIndex = 1) {
    if (startFromIndex >= allInputLines.length) {
        return;
    }

    const firstRawString = allInputLines[startFromIndex];
    const secondRawString = allInputLines[startFromIndex + 1];

    if (firstRawString === undefined || secondRawString === undefined) {
        return;
    }

    try {
        const cleanedFirst = purifyText(firstRawString);
        const cleanedSecond = purifyText(secondRawString);

        const finalScore = computeMatchScore(cleanedFirst, cleanedSecond);
        displayOutcome(finalScore);

    } catch (processingError) {
        displayOutcome(processingError);
    }

    coordinateProcessingRecursively(allInputLines, startFromIndex + 2);
}

if (typeof process !== "undefined") {
    new DataStreamAggregator(coordinateProcessingRecursively);
}