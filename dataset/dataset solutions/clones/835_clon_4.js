const FIELD_HEIGHT_DIM = 12;
const FIELD_WIDTH_DIM = 6;

function discoverConnectedPieces(currentGrid, startRow, startCol, pieceKind, visitedTracker) {
    const queue = [[startRow, startCol]];
    const componentPieces = [];
    visitedTracker.add(`${startRow},${startCol}`);
    componentPieces.push([startRow, startCol]);

    const rowOffsets = [-1, 0, 0, 1];
    const colOffsets = [0, -1, 1, 0];

    let queueHead = 0;
    while (queueHead < queue.length) {
        const [currentRow, currentCol] = queue[queueHead++];

        for (let k = 0; k < 4; k++) {
            const adjacentRow = currentRow + rowOffsets[k];
            const adjacentCol = currentCol + colOffsets[k];

            if (adjacentRow >= 0 && adjacentCol >= 0 && adjacentRow < FIELD_HEIGHT_DIM && adjacentCol < FIELD_WIDTH_DIM) {
                const cellIdentifier = `${adjacentRow},${adjacentCol}`;
                if (!visitedTracker.has(cellIdentifier) && currentGrid[adjacentRow][adjacentCol] === pieceKind) {
                    visitedTracker.add(cellIdentifier);
                    queue.push([adjacentRow, adjacentCol]);
                    componentPieces.push([adjacentRow, adjacentCol]);
                }
            }
        }
    }
    return componentPieces;
}

function applyFieldGravity(gridToModify) {
    for (let currentColumn = 0; currentColumn < FIELD_WIDTH_DIM; currentColumn++) {
        const existingPieces = [];
        for (let currentRow = FIELD_HEIGHT_DIM - 1; currentRow >= 0; currentRow--) {
            if (gridToModify[currentRow][currentColumn] !== '.') {
                existingPieces.unshift(gridToModify[currentRow][currentColumn]);
            }
        }
        for (let currentRow = 0; currentRow < FIELD_HEIGHT_DIM; currentRow++) {
            gridToModify[currentRow][currentColumn] = existingPieces[currentRow] || '.';
        }
    }
}

function executePuzzleSolver(inputSource) {
    const dataRows = inputSource.trim().split("\n");
    const numberOfScenarios = parseInt(dataRows.shift(), 10);
    const finalScores = [];

    for (let scenarioIndex = 0; scenarioIndex < numberOfScenarios; scenarioIndex++) {
        const gameBoard = [];
        for (let boardRow = 0; boardRow < FIELD_HEIGHT_DIM; boardRow++) {
            gameBoard.push(dataRows.shift().split(""));
        }

        let currentChainCount = 0;

        while (true) {
            const primaryRemovalTargets = new Set();
            const visitedForGroups = new Set();

            for (let r = 0; r < FIELD_HEIGHT_DIM; r++) {
                for (let c = 0; c < FIELD_WIDTH_DIM; c++) {
                    const currentCellContent = gameBoard[r][c];
                    const cellCoordKey = `${r},${c}`;

                    if (currentCellContent !== '.' && currentCellContent !== 'O' && !visitedForGroups.has(cellCoordKey)) {
                        const detectedGroup = discoverConnectedPieces(gameBoard, r, c, currentCellContent, visitedForGroups);
                        if (detectedGroup.length >= 4) {
                            detectedGroup.forEach(coords => primaryRemovalTargets.add(`${coords[0]},${coords[1]}`));
                        }
                    }
                }
            }

            if (primaryRemovalTargets.size === 0) {
                break;
            }

            currentChainCount++;

            const completeRemovalSet = new Set(primaryRemovalTargets);
            const rowOffsets = [-1, 0, 0, 1];
            const colOffsets = [0, -1, 1, 0];
            
            const targetsArray = Array.from(primaryRemovalTargets);
            for (const coordString of targetsArray) {
                const [currR, currC] = coordString.split(',').map(Number);

                for (let k = 0; k < 4; k++) {
                    const adjR = currR + rowOffsets[k];
                    const adjC = currC + colOffsets[k];

                    if (adjR >= 0 && adjC >= 0 && adjR < FIELD_HEIGHT_DIM && adjC < FIELD_WIDTH_DIM) {
                        const adjCellKey = `${adjR},${adjC}`;
                        if (gameBoard[adjR][adjC] === 'O' && !completeRemovalSet.has(adjCellKey)) {
                            completeRemovalSet.add(adjCellKey);
                        }
                    }
                }
            }

            completeRemovalSet.forEach(coordStr => {
                const [clearR, clearC] = coordStr.split(',').map(Number);
                gameBoard[clearR][clearC] = '.';
            });

            applyFieldGravity(gameBoard);
        }
        finalScores.push(currentChainCount);
    }
    return finalScores;
}

const rawDataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const computedScores = executePuzzleSolver(rawDataSource);
computedScores.forEach(scoreValue => console.log(scoreValue));