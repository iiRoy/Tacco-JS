const streamReader = require('readline').createInterface({
    input: process.stdin
});

const collectedLines = [];

streamReader.on('line', (entryData) => {
    collectedLines.push(entryData);
});

streamReader.on('close', () => {
    processAllData(collectedLines);
});

function processAllData(receivedData) {
    const [mainGridRows, mainGridCols] = receivedData[0].split(' ').map(Number);
    const primaryGrid = receivedData.slice(1, 1 + mainGridRows);
    const [patternRows, patternCols] = receivedData[1 + mainGridRows].split(' ').map(Number);
    const targetPattern = receivedData.slice(1 + mainGridRows + 1, 1 + mainGridRows + 1 + patternRows);

    initiateSearch(mainGridRows, mainGridCols, primaryGrid, patternRows, patternCols, targetPattern);
}

function initiateSearch(gridHeight, gridWidth, gridContent, patternHeight, patternWidth, patternContent) {
    const horizontalAlignmentRegistry = new Map();

    for (let currentGridRow = 0; currentGridRow < gridHeight; currentGridRow++) {
        for (let currentPatternRow = 0; currentPatternRow < patternHeight; currentPatternRow++) {
            const currentGridRowString = gridContent[currentGridRow];
            const currentPatternRowString = patternContent[currentPatternRow];

            for (let colStart = 0; colStart <= currentGridRowString.length - patternWidth; colStart++) {
                const segment = currentGridRowString.substring(colStart, colStart + patternWidth);
                if (segment === currentPatternRowString) {
                    if (!horizontalAlignmentRegistry.has(currentGridRow)) {
                        horizontalAlignmentRegistry.set(currentGridRow, new Map());
                    }
                    const rowPatternMatches = horizontalAlignmentRegistry.get(currentGridRow);

                    if (!rowPatternMatches.has(currentPatternRow)) {
                        rowPatternMatches.set(currentPatternRow, new Set());
                    }
                    rowPatternMatches.get(currentPatternRow).add(colStart);
                }
            }
        }
    }

    const discoveredLocations = [];

    for (let referenceRow = 0; referenceRow <= gridHeight - patternHeight; referenceRow++) {
        for (let referenceCol = 0; referenceCol <= gridWidth - patternWidth; referenceCol++) {
            let completeMatchFound = true;
            for (let pRowOffset = 0; pRowOffset < patternHeight; pRowOffset++) {
                const correspondingGridRow = referenceRow + pRowOffset;
                const patternRowToCheck = pRowOffset;

                const rowMatchInfo = horizontalAlignmentRegistry.get(correspondingGridRow);

                if (!rowMatchInfo || !rowMatchInfo.has(patternRowToCheck) || !rowMatchInfo.get(patternRowToCheck).has(referenceCol)) {
                    completeMatchFound = false;
                    break;
                }
            }

            if (completeMatchFound) {
                discoveredLocations.push(`${referenceRow} ${referenceCol}`);
            }
        }
    }

    discoveredLocations.forEach(location => console.log(location));
}