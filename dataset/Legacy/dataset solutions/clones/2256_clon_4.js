var fs = require("fs");

const ROW_DELTAS = [-1, 0, 1, 0];
const COL_DELTAS = [0, -1, 0, 1];

class GridTraversalQueue {
    constructor() {
        this.storage = [];
        this.front = 0;
    }

    addPoint(element) {
        this.storage.push(element);
    }

    retrievePoint() {
        if (this.isEmpty()) {
            return undefined;
        }
        const element = this.storage[this.front];
        this.front++;
        if (this.front > 2048 && this.front > this.storage.length / 4) {
            this.storage = this.storage.slice(this.front);
            this.front = 0;
        }
        return element;
    }

    isEmpty() {
        return this.front === this.storage.length;
    }
}

function performBFS(initialRow, initialCol, totalRows, totalCols, gridLayout, rDeltas, cDeltas) {
    const currentPathDistances = new Map();
    const bfsQueue = new GridTraversalQueue();
    let maximumDistanceInPath = 0;

    const startKey = `${initialRow},${initialCol}`;
    currentPathDistances.set(startKey, 0);
    bfsQueue.addPoint([initialRow, initialCol]);

    while (!bfsQueue.isEmpty()) {
        const [currentRow, currentCol] = bfsQueue.retrievePoint();
        const currentCellDistance = currentPathDistances.get(`${currentRow},${currentCol}`);
        maximumDistanceInPath = Math.max(maximumDistanceInPath, currentCellDistance);

        for (let k = 0; k < 4; k++) {
            const nextRow = currentRow + rDeltas[k];
            const nextCol = currentCol + cDeltas[k];
            const nextCellKey = `${nextRow},${nextCol}`;

            if (nextRow >= 0 && nextRow < totalRows &&
                nextCol >= 0 && nextCol < totalCols &&
                gridLayout[nextRow][nextCol] === '.' &&
                !currentPathDistances.has(nextCellKey)) {
                
                currentPathDistances.set(nextCellKey, currentCellDistance + 1);
                bfsQueue.addPoint([nextRow, nextCol]);
            }
        }
    }
    return maximumDistanceInPath;
}

const solveLabyrinth = (rawInput) => {
    const inputLines = rawInput.split('\n');
    const dimensions = inputLines[0].split(' ').map(Number);
    const gridRows = dimensions[0];
    const gridCols = dimensions[1];

    const mapLayout = [];
    for (let i = 0; i < gridRows; i++) {
        mapLayout.push(inputLines[i + 1].split(''));
    }

    let overallMaxDistance = 0;

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            if (mapLayout[r][c] === '.') {
                const pathMaxFromStart = performBFS(r, c, gridRows, gridCols, mapLayout, ROW_DELTAS, COL_DELTAS);
                overallMaxDistance = Math.max(overallMaxDistance, pathMaxFromStart);
            }
        }
    }

    console.log(overallMaxDistance);
};

solveLabyrinth(fs.readFileSync('/dev/stdin', 'utf8'));
