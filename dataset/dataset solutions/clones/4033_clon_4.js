'use strict';

function CoordinateQueue() {
    this.elements = [];
    this.head = 0;
}

CoordinateQueue.prototype.enqueue = function(element) {
    this.elements.push(element);
};

CoordinateQueue.prototype.dequeue = function() {
    if (this.head === this.elements.length) {
        this.head = 0;
        this.elements = [];
        return undefined;
    }
    const item = this.elements[this.head];
    this.head++;
    return item;
};

CoordinateQueue.prototype.isEmpty = function() {
    return this.head === this.elements.length;
};

const generateCoordinateKey = (r, c) => `${r},${c}`;

const findShortestPath = (gridRows, gridCols, terrainMap, startPoint, endPoint) => {
    const traversalQueue = new CoordinateQueue();
    const distanceTracker = new Map();

    const initialKey = generateCoordinateKey(startPoint.row, startPoint.col);
    traversalQueue.enqueue(startPoint);
    distanceTracker.set(initialKey, 1);

    const movementVectors = [
        { dR: 0, dC: 1 },
        { dR: 1, dC: 0 },
        { dR: 0, dC: -1 },
        { dR: -1, dC: 0 }
    ];

    while (!traversalQueue.isEmpty()) {
        const currentPosition = traversalQueue.dequeue();
        const currentPositionKey = generateCoordinateKey(currentPosition.row, currentPosition.col);

        if (currentPosition.row === endPoint.row && currentPosition.col === endPoint.col) {
            return distanceTracker.get(currentPositionKey);
        }

        for (const vector of movementVectors) {
            const nextRow = currentPosition.row + vector.dR;
            const nextCol = currentPosition.col + vector.dC;
            const nextPositionKey = generateCoordinateKey(nextRow, nextCol);

            if (nextRow < 0 || nextRow >= gridRows || nextCol < 0 || nextCol >= gridCols) continue;
            if (terrainMap[nextRow][nextCol] === '#') continue;
            if (distanceTracker.has(nextPositionKey)) continue;

            distanceTracker.set(nextPositionKey, distanceTracker.get(currentPositionKey) + 1);
            traversalQueue.enqueue({ row: nextRow, col: nextCol });
        }
    }

    return -1;
};

const calculateOpenCells = (gridData) => {
    return gridData.reduce((totalCount, currentRow) => {
        return totalCount + currentRow.filter(cellContent => cellContent === '.').length;
    }, 0);
};

function processInput(inputString) {
    const lines = inputString.split('\n');
    const [rowsStr, colsStr] = lines[0].split(' ');
    const totalRows = Number(rowsStr);
    const totalCols = Number(colsStr);

    const startRow = 0;
    const startCol = 0;
    const goalRow = totalRows - 1;
    const goalCol = totalCols - 1;

    const gridLines = lines.slice(1, totalRows + 1);
    const gridLayout = gridLines.map(line => [...line]);

    const pathLength = findShortestPath(
        totalRows,
        totalCols,
        gridLayout,
        { row: startRow, col: startCol },
        { row: goalRow, col: goalCol }
    );

    let finalResult = 0;
    if (pathLength === -1) {
        finalResult = -1;
    } else {
        const openCellCount = calculateOpenCells(gridLayout);
        finalResult = openCellCount - pathLength;
    }

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
