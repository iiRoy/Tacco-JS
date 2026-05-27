class PuyoPuyoGame {
    constructor(initialGrid) {
        this.gameGrid = initialGrid;
        this.gridRows = 12;
        this.gridCols = 6;
        this.directionVectors = [[-1, 0], [0, -1], [0, 1], [1, 0]]; // Up, Left, Right, Down
    }

    isCoordinateValid(r, c) {
        return r >= 0 && r < this.gridRows && c >= 0 && c < this.gridCols;
    }

    identifyChainRoots() {
        const visitedCells = new Set();
        const chainStartingPoints = [];

        for (let r = 0; r < this.gridRows; r++) {
            for (let c = 0; c < this.gridCols; c++) {
                const cellContent = this.gameGrid[r][c];

                if (cellContent !== '.' && !visitedCells.has(`${r},${c}`)) {
                    const currentChainComponents = [];
                    const bfsQueue = [[r, c]];
                    visitedCells.add(`${r},${c}`);
                    const targetColor = cellContent;
                    let queuePointer = 0;

                    while (queuePointer < bfsQueue.length) {
                        const [currentRow, currentCol] = bfsQueue[queuePointer++];
                        currentChainComponents.push([currentRow, currentCol]);

                        for (const [dr, dc] of this.directionVectors) {
                            const nextRow = currentRow + dr;
                            const nextCol = currentCol + dc;

                            if (this.isCoordinateValid(nextRow, nextCol) &&
                                this.gameGrid[nextRow][nextCol] === targetColor &&
                                !visitedCells.has(`${nextRow},${nextCol}`)) {
                                visitedCells.add(`${nextRow},${nextCol}`);
                                bfsQueue.push([nextRow, nextCol]);
                            }
                        }
                    }

                    if (currentChainComponents.length >= 4) {
                        chainStartingPoints.push([r, c]);
                    }
                }
            }
        }
        return chainStartingPoints;
    }

    detonateAndClear(chainRoots) {
        const cellsToObliterate = new Set();

        for (const [rootY, rootX] of chainRoots) {
            const colorToErase = this.gameGrid[rootY][rootX];
            if (colorToErase === '.') continue;

            const bombPropagationQueue = [[rootY, rootX]];
            const bombVisitedLocal = new Set();
            bombVisitedLocal.add(`${rootY},${rootX}`);
            let queuePointer = 0;

            while (queuePointer < bombPropagationQueue.length) {
                const [currentY, currentX] = bombPropagationQueue[queuePointer++];
                cellsToObliterate.add(`${currentY},${currentX}`);

                for (const [dr, dc] of this.directionVectors) {
                    const neighborY = currentY + dr;
                    const neighborX = currentX + dc;

                    if (this.isCoordinateValid(neighborY, neighborX)) {
                        const neighborContent = this.gameGrid[neighborY][neighborX];
                        if (neighborContent === colorToErase && !bombVisitedLocal.has(`${neighborY},${neighborX}`)) {
                            bombVisitedLocal.add(`${neighborY},${neighborX}`);
                            bombPropagationQueue.push([neighborY, neighborX]);
                        } else if (neighborContent === 'O') {
                            cellsToObliterate.add(`${neighborY},${neighborX}`);
                        }
                    }
                }
            }
        }

        for (const cellKey of cellsToObliterate) {
            const [y, x] = cellKey.split(',').map(Number);
            this.gameGrid[y][x] = '.';
        }
    }

    applyDownwardForce() {
        for (let c = 0; c < this.gridCols; c++) {
            let writePosition = this.gridRows - 1;
            for (let r = this.gridRows - 1; r >= 0; r--) {
                if (this.gameGrid[r][c] !== '.') {
                    this.gameGrid[writePosition][c] = this.gameGrid[r][c];
                    if (writePosition !== r) {
                        this.gameGrid[r][c] = '.';
                    }
                    writePosition--;
                }
            }
            for (let r = writePosition; r >= 0; r--) {
                this.gameGrid[r][c] = '.';
            }
        }
    }

    simulateGame() {
        let chainReactionCount = 0;
        while (true) {
            const activeChainRoots = this.identifyChainRoots();
            if (activeChainRoots.length === 0) {
                break;
            }
            chainReactionCount++;
            this.detonateAndClear(activeChainRoots);
            this.applyDownwardForce();
        }
        return chainReactionCount;
    }
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split("\n");
const numberOfGames = parseInt(inputLines.shift(), 10);

for (let gameIndex = 0; gameIndex < numberOfGames; gameIndex++) {
    const currentBoard = [];
    for (let i = 0; i < 12; i++) {
        currentBoard.push(inputLines.shift().split(""));
    }
    
    const gameInstance = new PuyoPuyoGame(currentBoard);
    const result = gameInstance.simulateGame();
    console.log(result);
}
