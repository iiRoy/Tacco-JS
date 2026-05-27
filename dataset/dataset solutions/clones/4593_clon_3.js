"use strict";
const fileSystem = require("fs");
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

const InputReader = (() => {
    let tokenStream = rawInputData.split(/ |\n/);
    let tokenPointer = 0;

    const getNextToken = () => tokenStream[tokenPointer++];
    const parseNumber = () => +getNextToken();
    const parseString = () => getNextToken();
    const parseBigInt = () => BigInt(getNextToken());

    const readMultiple = (count, mapFn) => {
        const segment = tokenStream.slice(tokenPointer, tokenPointer + count);
        tokenPointer += count;
        return mapFn ? segment.map(mapFn) : segment;
    };

    const readMatrixData = (rows, cols, mapFn) => {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const rowSegment = tokenStream.slice(tokenPointer, tokenPointer + cols);
            tokenPointer += cols;
            matrix.push(mapFn ? rowSegment.map(mapFn) : rowSegment);
        }
        return matrix;
    };

    const generateMultiDimensionalArray = (valueInitializer) => {
        const args = arguments;
        let argCount = args.length;
        let arrayCreationString = `Array(args[${--argCount}]).fill().map(x=>{return ${valueInitializer};})`;
        while (--argCount) {
            arrayCreationString = `Array(args[${argCount}]).fill().map(x=>${arrayCreationString})`;
        }
        return eval(arrayCreationString);
    };

    return {
        readNum: parseNumber,
        readStr: parseString,
        readBigInt: parseBigInt,
        readNumsOrStrs: readMultiple,
        readMatrix: readMatrixData,
        createMultiDimArray: generateMultiDimensionalArray
    };
})();

function calculateGridDistances(inputGrid, startXCoord, startYCoord) {
    const pathChar = ".";
    const obstacleChar = "#";
    const infinityVal = 1e9;

    const gridHeight = inputGrid.length;
    const gridWidth = inputGrid[0].length;

    const initialize2DArray = (rows, cols, initialValue) => {
        return Array(rows).fill(null).map(() => Array(cols).fill(initialValue));
    };

    const distanceGrid = initialize2DArray(gridHeight, gridWidth, infinityVal);

    // Directions: [deltaX, deltaY] for Up, Right, Down, Left
    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const directionCount = directions.length;

    let currentQueue = [startXCoord, startYCoord];
    let currentDistance = 1;

    distanceGrid[startYCoord][startXCoord] = 0;

    const isWithinBounds = (x, y) => {
        return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
    };

    while (currentQueue.length > 0) {
        let nextQueue = [];
        while (currentQueue.length > 0) {
            // Pop x, y from the end of the queue (original used pop twice, effectively LIFO for a pair)
            const currY = currentQueue.pop();
            const currX = currentQueue.pop();

            for (let i = 0; i < directionCount; i++) {
                const [deltaX, deltaY] = directions[i];
                const nextX = currX + deltaX;
                const nextY = currY + deltaY;

                if (!isWithinBounds(nextX, nextY)) {
                    continue;
                }

                const targetCellContent = inputGrid[nextY][nextX];
                const existingCellDistance = distanceGrid[nextY][nextX];

                if (targetCellContent === obstacleChar || existingCellDistance !== infinityVal) {
                    continue;
                }

                distanceGrid[nextY][nextX] = currentDistance;
                nextQueue.push(nextX, nextY);
            }
        }
        currentDistance++;
        currentQueue = nextQueue;
    }
    return distanceGrid;
}

const finalResult = solveProblem();
if (finalResult !== undefined) {
    console.log(finalResult);
}

function solveProblem() {
    const gridH = InputReader.readNum();
    const gridW = InputReader.readNum();
    const maxMoveK = InputReader.readNum();

    // Read the grid as an array of strings.
    // Original `nexts(h,1)` reads `h` strings because `1` is truthy.
    const inputGrid = InputReader.readNumsOrStrs(gridH, (s) => s);

    let startX = -1;
    let startY = -1;

    const findStartCoordinates = (grid) => {
        for (let rowIdx = 0; rowIdx < grid.length; rowIdx++) {
            const sCharIndex = grid[rowIdx].indexOf("S");
            if (sCharIndex >= 0) {
                return { x: sCharIndex, y: rowIdx };
            }
        }
        return { x: -1, y: -1 }; // Should not be reached if 'S' is guaranteed
    };

    const startCoords = findStartCoordinates(inputGrid);
    startX = startCoords.x;
    startY = startCoords.y;

    const shortestDistances = calculateGridDistances(inputGrid, startX, startY);

    let minTurns = 1e9; // Initialize with a large value

    const calculateTurnsToEdge = (distanceFromEdge, stepSize) => {
        // Calculates the minimum number of 'stepSize' jumps required to cover 'distanceFromEdge'.
        return Math.ceil(distanceFromEdge / stepSize);
    };

    for (let rowIdx = 0; rowIdx < gridH; rowIdx++) {
        for (let colIdx = 0; colIdx < gridW; colIdx++) {
            const currentCellDistance = shortestDistances[rowIdx][colIdx];

            // Guard clause: if current cell is unreachable within K unit steps from 'S', skip it.
            if (currentCellDistance > maxMoveK) {
                continue;
            }

            // Calculate turns to reach each of the four edges from the current cell (rowIdx, colIdx)
            const turnsToEdgeTop = calculateTurnsToEdge(rowIdx, maxMoveK);
            const turnsToEdgeLeft = calculateTurnsToEdge(colIdx, maxMoveK);
            const turnsToEdgeBottom = calculateTurnsToEdge(gridH - rowIdx - 1, maxMoveK);
            const turnsToEdgeRight = calculateTurnsToEdge(gridW - colIdx - 1, maxMoveK);

            // The total number of K-jumps is 1 (to reach current cell from 'S')
            // plus the minimum K-jumps from current cell to any edge.
            const currentMinTurns = Math.min(
                turnsToEdgeTop,
                turnsToEdgeLeft,
                turnsToEdgeBottom,
                turnsToEdgeRight
            ) + 1;

            if (currentMinTurns < minTurns) {
                minTurns = currentMinTurns;
            }
        }
    }
    return minTurns;
}
