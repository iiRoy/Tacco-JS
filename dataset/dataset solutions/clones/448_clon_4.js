const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

function* inputParser(rawDataBlob) {
    const textLines = rawDataBlob.trim().split('\n');
    let currentLineIndex = 0;

    while (currentLineIndex < textLines.length) {
        const dimensionsString = textLines[currentLineIndex++].split(' ').map(Number);
        const gridWidth = dimensionsString[0];
        const gridHeight = dimensionsString[1];

        if (gridWidth === 0 && gridHeight === 0) {
            break;
        }

        const tileArrangement = [];
        for (let r = 0; r < gridHeight; r++) {
            tileArrangement.push(textLines[currentLineIndex++].split(' ').map(Number));
        }

        yield { extentX: gridWidth, extentY: gridHeight, layout: tileArrangement };
    }
}

for (const currentScenario of inputParser(fileContent)) {
    const scenarioWidth = currentScenario.extentX;
    const scenarioHeight = currentScenario.extentY;
    const scenarioLayout = currentScenario.layout;

    const cumulativePathCounts = Array.from({ length: scenarioHeight }, () => []);

    const calculateCellPaths = (yCoord, xCoord) => {
        if (cumulativePathCounts[yCoord] && cumulativePathCounts[yCoord][xCoord] !== undefined) {
            return cumulativePathCounts[yCoord][xCoord];
        }

        let computedValue = 0;
        const currentTileType = scenarioLayout[yCoord][xCoord];

        if (yCoord === 0) {
            computedValue = (currentTileType === 0) ? 1 : 0;
        } else {
            if (currentTileType === 1) {
                computedValue = 0;
            } else {
                let diagonalLeftPrev = 0;
                if (xCoord > 0) {
                    const typeAtPrevLeft = scenarioLayout[yCoord - 1][xCoord - 1];
                    if (typeAtPrevLeft !== 2) {
                        diagonalLeftPrev = calculateCellPaths(yCoord - 1, xCoord - 1);
                    }
                }

                let directUpPrev = 0;
                const typeAtPrevUp = scenarioLayout[yCoord - 1][xCoord];
                if (typeAtPrevUp !== 2) {
                    directUpPrev = calculateCellPaths(yCoord - 1, xCoord);
                }

                let diagonalRightPrev = 0;
                if (xCoord < scenarioWidth - 1) {
                    const typeAtPrevRight = scenarioLayout[yCoord - 1][xCoord + 1];
                    if (typeAtPrevRight !== 2) {
                        diagonalRightPrev = calculateCellPaths(yCoord - 1, xCoord + 1);
                    }
                }

                let twoStepUp = 0;
                if (yCoord >= 2) {
                    const typeAtTwoUp = scenarioLayout[yCoord - 2][xCoord];
                    if (typeAtTwoUp === 2) {
                        twoStepUp = calculateCellPaths(yCoord - 2, xCoord);
                    }
                }

                if (currentTileType === 0) {
                    computedValue = diagonalLeftPrev + directUpPrev + diagonalRightPrev + twoStepUp;
                } else if (currentTileType === 2) {
                    computedValue = directUpPrev + twoStepUp;
                }
            }
        }

        if (!cumulativePathCounts[yCoord]) {
            cumulativePathCounts[yCoord] = [];
        }
        cumulativePathCounts[yCoord][xCoord] = computedValue;
        return computedValue;
    };

    for (let y = 0; y < scenarioHeight; y++) {
        for (let x = 0; x < scenarioWidth; x++) {
            calculateCellPaths(y, x);
        }
    }

    let finalAccumulation = 0;

    const lastTwoRows = [];
    if (scenarioHeight >= 2) {
        lastTwoRows.push(scenarioHeight - 2);
    }
    if (scenarioHeight >= 1) {
        lastTwoRows.push(scenarioHeight - 1);
    }

    finalAccumulation = lastTwoRows.reduce((currentTotal, rowIdentifier) => {
        return currentTotal + Array.from({ length: scenarioWidth }, (_, colIdentifier) => {
            const pathValue = cumulativePathCounts[rowIdentifier][colIdentifier];
            const tileValue = scenarioLayout[rowIdentifier][colIdentifier];

            if (rowIdentifier === scenarioHeight - 2) {
                if (tileValue === 2) {
                    return pathValue;
                }
            } else if (rowIdentifier === scenarioHeight - 1) {
                if (tileValue === 0 || tileValue === 2) {
                    return pathValue;
                }
            }
            return 0;
        }).reduce((rowSum, val) => rowSum + val, 0);
    }, 0);

    console.log(finalAccumulation);
}