const GRID_ROWS = 12;
const GRID_COLS = 6;
const NEIGHBOR_DELTAS = [[-1, 0], [0, -1], [0, 1], [1, 0]];

function findClustersAndBombs(gridState) {
    const cellsToExplode = new Set();
    const visitedInRound = new Set();

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const currentCellKey = `${r},${c}`;
            const currentCellColor = gridState[r][c];

            if (currentCellColor !== "." && currentCellColor !== "O" && !visitedInRound.has(currentCellKey)) {
                const currentCluster = new Set();
                const searchQueue = [[r, c]];
                currentCluster.add(currentCellKey);
                visitedInRound.add(currentCellKey);

                let queuePointer = 0;
                while (queuePointer < searchQueue.length) {
                    const [currR, currC] = searchQueue[queuePointer++];

                    for (const [dr, dc] of NEIGHBOR_DELTAS) {
                        const nextR = currR + dr;
                        const nextC = currC + dc;
                        const nextCellKey = `${nextR},${nextC}`;

                        if (nextR >= 0 && nextR < GRID_ROWS &&
                            nextC >= 0 && nextC < GRID_COLS &&
                            gridState[nextR][nextC] === currentCellColor &&
                            !visitedInRound.has(nextCellKey)) {
                            
                            visitedInRound.add(nextCellKey);
                            currentCluster.add(nextCellKey);
                            searchQueue.push([nextR, nextC]);
                        }
                    }
                }

                if (currentCluster.size >= 4) {
                    currentCluster.forEach(coord => cellsToExplode.add(coord));
                }
            }
        }
    }
    return cellsToExplode;
}

function applyExplosionsAndClearOs(initialGrid, cellsToExplode) {
    const nextGridState = initialGrid.map(row => [...row]);

    if (cellsToExplode.size === 0) {
        return nextGridState;
    }

    cellsToExplode.forEach(coordKey => {
        const [r, c] = coordKey.split(',').map(Number);
        nextGridState[r][c] = ".";
    });

    cellsToExplode.forEach(coordKey => {
        const [r, c] = coordKey.split(',').map(Number);
        for (const [dr, dc] of NEIGHBOR_DELTAS) {
            const nextR = r + dr;
            const nextC = c + dc;

            if (nextR >= 0 && nextR < GRID_ROWS &&
                nextC >= 0 && nextC < GRID_COLS &&
                nextGridState[nextR][nextC] === "O") {
                nextGridState[nextR][nextC] = ".";
            }
        }
    });

    return nextGridState;
}

function applyGravityToGrid(gridBeforeGravity) {
    const gridAfterGravity = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill("."));

    for (let c = 0; c < GRID_COLS; c++) {
        let currentFillRow = GRID_ROWS - 1;
        for (let r = GRID_ROWS - 1; r >= 0; r--) {
            if (gridBeforeGravity[r][c] !== ".") {
                gridAfterGravity[currentFillRow--][c] = gridBeforeGravity[r][c];
            }
        }
    }
    return gridAfterGravity;
}

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = inputData.trim().split("\n");
const numberOfTestCases = parseInt(inputLines.shift(), 10);

for (let caseIdx = 0; caseIdx < numberOfTestCases; caseIdx++) {
    let currentPuzzleGrid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        currentPuzzleGrid.push(inputLines.shift().split(""));
    }

    let explosionCount = 0;
    while (true) {
        const cellsToClearThisIteration = findClustersAndBombs(currentPuzzleGrid);

        if (cellsToClearThisIteration.size === 0) {
            break;
        }

        explosionCount++;
        
        const gridAfterClearing = applyExplosionsAndClearOs(currentPuzzleGrid, cellsToClearThisIteration);
        currentPuzzleGrid = applyGravityToGrid(gridAfterClearing);
    }
    console.log(explosionCount);
}
