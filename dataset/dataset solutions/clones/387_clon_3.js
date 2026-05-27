let gridSize;
let gridMatrix;
let lastVisited;

const DIRECTION_VECTORS = [
    { dr: -1, dc: 0 }, // 0: Up
    { dr: 0, dc: 1 },  // 1: Right
    { dr: 1, dc: 0 },  // 2: Down
    { dr: 0, dc: -1 }  // 3: Left
];

const RECURSION_OFFSETS = [
    { rOffset: 2, cOffset: 1, newDir: 1 }, // If current directionIdx was 0 (Up)
    { rOffset: 1, cOffset: -2, newDir: 2 }, // If current directionIdx was 1 (Right)
    { rOffset: -2, cOffset: -1, newDir: 3 }, // If current directionIdx was 2 (Down)
    { rOffset: -1, cOffset: 2, newDir: 0 }  // If current directionIdx was 3 (Left)
];

function explorePath(currentRow, currentCol, currentDirection) {
    if (gridMatrix[currentRow][currentCol] !== "+") {
        return;
    }

    const { dr, dc } = DIRECTION_VECTORS[currentDirection];
    let potentialNextRow = currentRow + dr;
    let potentialNextCol = currentCol + dc;

    const isOutOfBounds = (r, c) => r < 0 || c < 0 || r >= gridSize || c >= gridSize;

    if (isOutOfBounds(potentialNextRow, potentialNextCol)) {
        let nextDirection = (currentDirection + 1) % 4;
        explorePath(currentRow, currentCol, nextDirection);
    } else {
        if (gridMatrix[potentialNextRow][potentialNextCol] === "#") {
            let previousRow = potentialNextRow - dr;
            let previousCol = potentialNextCol - dc;
            gridMatrix[previousRow][previousCol] = "+";

            const { rOffset, cOffset, newDir } = RECURSION_OFFSETS[currentDirection];
            let newStartRow = potentialNextRow + rOffset;
            let newStartCol = potentialNextCol + cOffset;
            explorePath(newStartRow, newStartCol, newDir);
        } else {
            gridMatrix[currentRow][currentCol] = "#";
            lastVisited = [currentRow, currentCol];
            explorePath(potentialNextRow, potentialNextCol, currentDirection);
        }
    }
}

function handleSmallGridCases(size) {
    if (size === 0) {
        console.log("");
        return true;
    }
    if (size === 1) {
        console.log("#");
        return true;
    }
    if (size === 2) {
        console.log("##\n# ");
        return true;
    }
    return false;
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let processedNumbers = fileContent.trim().split("\n").map(Number);
let remainingTestCases = processedNumbers.shift();

while (remainingTestCases--) {
    gridSize = processedNumbers.shift();

    if (handleSmallGridCases(gridSize)) {
        continue;
    }

    gridMatrix = Array.from({ length: gridSize }, () => Array(gridSize).fill("+"));

    lastVisited = [];

    explorePath(gridSize - 1, 0, 0);

    if (gridSize % 2 === 0) {
        gridMatrix[lastVisited[0]][lastVisited[1]] = "+";
    }

    const formattedOutput = gridMatrix
        .map(row => row.join(""))
        .join("\n")
        .replace(/\+/g, " ");
    console.log(formattedOutput);
}
