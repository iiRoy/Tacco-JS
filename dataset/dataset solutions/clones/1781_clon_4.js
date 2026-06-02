"use strict";
const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenBuffer = rawInput.split(/ |\n/);

let tokenCursor = 0;
const readNumber = () => Number(tokenBuffer[tokenCursor++]);
const readString = () => tokenBuffer[tokenCursor++];
const readNumberSequence = (count) => {
    const sequence = [];
    for (let i = 0; i < count; i++) {
        sequence.push(readNumber());
    }
    return sequence;
};

function createMultiDimArray(dimensions, initialValue) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDimSize }, () =>
        createMultiDimArray(remainingDims, initialValue)
    );
}

const finalResult = solveGridTraversal();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

function solveGridTraversal() {
    const MAX_PATH_COST = 1e9;
    const deltaRows = [0, 1, 0, -1];
    const deltaCols = [-1, 0, 1, 0];
    const numDirections = 4;

    const [gridHeight, gridWidth, maxJump] = readNumberSequence(3);
    const [startRow, startCol, goalRow, goalCol] = readNumberSequence(4);

    const obstacleGrid = createMultiDimArray([gridHeight + 2, gridWidth + 2], true); // true for obstacle, false for path

    for (let r = 0; r < gridHeight; r++) {
        const rowContent = readString();
        for (let c = 0; c < gridWidth; c++) {
            obstacleGrid[r + 1][c + 1] = (rowContent[c] === '@');
        }
    }

    const pathCosts = createMultiDimArray([gridHeight + 2, gridWidth + 2], MAX_PATH_COST);
    pathCosts[startRow][startCol] = 0;

    let currentLevelNodes = [[startRow, startCol]];
    let currentCost = 0;

    while (currentLevelNodes.length > 0) {
        const nextLevelNodes = [];
        while (currentLevelNodes.length > 0) {
            const [currentRow, currentCol] = currentLevelNodes.shift();

            for (let dirIndex = 0; dirIndex < numDirections; dirIndex++) {
                let nextRow = currentRow;
                let nextCol = currentCol;

                for (let stepCount = 0; stepCount < maxJump; stepCount++) {
                    nextRow += deltaRows[dirIndex];
                    nextCol += deltaCols[dirIndex];

                    if (obstacleGrid[nextRow][nextCol]) {
                        break; // Hit an obstacle
                    }

                    if (pathCosts[nextRow][nextCol] <= currentCost) {
                        // Already found a path to this cell with currentCost or less.
                        // A new path from currentCost would be currentCost + 1, which is not better.
                        // This condition is crucial for correctness and efficiency in level-by-level BFS.
                        break;
                    }

                    if (pathCosts[nextRow][nextCol] > currentCost + 1) {
                        pathCosts[nextRow][nextCol] = currentCost + 1;
                        nextLevelNodes.push([nextRow, nextCol]);
                    }
                }
            }
        }
        currentLevelNodes = nextLevelNodes;
        currentCost++;
    }

    return pathCosts[goalRow][goalCol] === MAX_PATH_COST ? -1 : pathCosts[goalRow][goalCol];
}
