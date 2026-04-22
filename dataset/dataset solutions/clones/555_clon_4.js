const fileSystem = require('node:fs');
const rawDataString = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawDataString.trim().split('\n');

function processAllBlocks(lineSource, currentLineIdx = 0) {
    if (currentLineIdx >= lineSource.length) {
        return;
    }

    const dimensionsLine = lineSource[currentLineIdx];
    if (!dimensionsLine) {
        return;
    }

    const dimensionValues = dimensionsLine.split(' ').map(Number);
    const rowCount = dimensionValues[0];
    const colCount = dimensionValues[1];

    if (rowCount === 0 && colCount === 0) {
        return;
    }

    const nextLineIdxAfterDims = currentLineIdx + 1;
    const linesForCurrentBlock = lineSource.slice(nextLineIdxAfterDims, nextLineIdxAfterDims + rowCount);

    const resultForBlock = calculateScoresAndRank(colCount, linesForCurrentBlock);
    process.stdout.write(resultForBlock.join(' ') + '\n');

    const nextBlockStartIdx = nextLineIdxAfterDims + rowCount;
    processAllBlocks(lineSource, nextBlockStartIdx);
}

function calculateScoresAndRank(numColumns, dataRows) {
    const initialColumnStates = Array.from({ length: numColumns }, (_, k) => ({
        columnIdentifier: k + 1,
        currentSum: 0
    }));

    const aggregatedColumnStates = dataRows.reduce((columnAccumulator, rowContent) => {
        const individualScores = rowContent.split(' ').map(Number);
        individualScores.forEach((scoreValue, colIndex) => {
            if (columnAccumulator[colIndex]) {
                columnAccumulator[colIndex].currentSum += scoreValue;
            }
        });
        return columnAccumulator;
    }, initialColumnStates);

    aggregatedColumnStates.sort((firstObject, secondObject) => {
        if (firstObject.currentSum !== secondObject.currentSum) {
            return secondObject.currentSum - firstObject.currentSum;
        }
        return firstObject.columnIdentifier - secondObject.columnIdentifier;
    });

    const finalRankedIdentifiers = aggregatedColumnStates.map(obj => obj.columnIdentifier);

    return finalRankedIdentifiers;
}

processAllBlocks(processedLines);