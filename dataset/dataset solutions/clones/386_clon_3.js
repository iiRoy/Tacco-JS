const ROW_OFFSETS = [-1, 0, 1, 0]; // Up, Right, Down, Left
const COL_OFFSETS = [0, 1, 0, -1]; // Up, Right, Down, Left

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
let numericInputLines = rawInput.trim().split("\n").map(Number);

let testCasesCount = numericInputLines.shift();

while (testCasesCount--) {
    const currentGridSize = numericInputLines.shift();

    if (currentGridSize === 0) {
        console.log("");
        continue;
    }
    if (currentGridSize === 1) {
        console.log("#");
        continue;
    }
    if (currentGridSize === 2) {
        const outputGridString = "##\n# ";
        console.log(outputGridString);
        continue;
    }

    const gridMatrix = [];
    for (let rIdx = 0; rIdx < currentGridSize; rIdx++) {
        const row = [];
        for (let cIdx = 0; cIdx < currentGridSize; cIdx++) {
            row.push("+");
        }
        gridMatrix.push(row);
    }

    let lastMarkedCell = [];

    function traverseAndFill(currentRow, currentCol, directionIndex) {
        if (gridMatrix[currentRow][currentCol] !== "+") {
            return;
        }

        const nextRow = currentRow + ROW_OFFSETS[directionIndex];
        const nextCol = currentCol + COL_OFFSETS[directionIndex];

        const isOutOfBounds = nextRow < 0 || nextCol < 0 || nextRow >= currentGridSize || nextCol >= currentGridSize;

        if (isOutOfBounds) {
            const newDirectionIndex = (directionIndex + 1) % 4;
            traverseAndFill(currentRow, currentCol, newDirectionIndex);
        } else {
            if (gridMatrix[nextRow][nextCol] === "#") {
                const cellBeforeCollisionRow = nextRow - ROW_OFFSETS[directionIndex];
                const cellBeforeCollisionCol = nextCol - COL_OFFSETS[directionIndex];
                gridMatrix[cellBeforeCollisionRow][cellBeforeCollisionCol] = "+";

                let newStartRow, newStartCol, newStartDirection;

                switch (directionIndex) {
                    case 3: // Original z=3 (Left)
                        newStartRow = nextRow - 1;
                        newStartCol = nextCol + 2;
                        newStartDirection = 0; // Up
                        break;
                    case 0: // Original z=0 (Up)
                        newStartRow = nextRow + 2;
                        newStartCol = nextCol + 1;
                        newStartDirection = 1; // Right
                        break;
                    case 1: // Original z=1 (Right)
                        newStartRow = nextRow + 1;
                        newStartCol = nextCol - 2;
                        newStartDirection = 2; // Down
                        break;
                    case 2: // Original z=2 (Down)
                        newStartRow = nextRow - 2;
                        newStartCol = nextCol - 1;
                        newStartDirection = 3; // Left
                        break;
                    default:
                        return;
                }
                traverseAndFill(newStartRow, newStartCol, newStartDirection);

            } else {
                gridMatrix[currentRow][currentCol] = "#";
                lastMarkedCell = [currentRow, currentCol];
                traverseAndFill(nextRow, nextCol, directionIndex);
            }
        }
    }

    traverseAndFill(currentGridSize - 1, 0, 0);

    if (currentGridSize % 2 === 0) {
        gridMatrix[lastMarkedCell[0]][lastMarkedCell[1]] = "+";
    }

    const finalOutput = gridMatrix.map(row => row.join("")).join("\n").replace(/\+/g, " ");
    console.log(finalOutput);
}
