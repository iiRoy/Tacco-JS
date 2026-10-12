function navigateGrid(initialRow, initialCol, gridData) {
    let currentRow = initialRow;
    let currentCol = initialCol;
    const visitedCoordinates = new Set();

    const movementDispatch = {
        '>': (r, c) => [r, c + 1],
        '<': (r, c) => [r, c - 1],
        '^': (r, c) => [r - 1, c],
        'v': (r, c) => [r + 1, c]
    };

    while (true) {
        const currentPositionKey = `${currentRow},${currentCol}`;

        if (visitedCoordinates.has(currentPositionKey)) {
            return "LOOP";
        }

        const cellContent = gridData[currentRow][currentCol];

        if (cellContent === '.') {
            return `${currentCol} ${currentRow}`;
        }

        visitedCoordinates.add(currentPositionKey);

        const nextCoords = movementDispatch[cellContent](currentRow, currentCol);
        currentRow = nextCoords[0];
        currentCol = nextCoords[1];
    }
}

const rawInputText = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputText.trim().split("\n");
let currentLineIndex = 0;

while (true) {
    const dimensions = inputLines[currentLineIndex++].split(" ").map(Number);
    const [gridRows, gridCols] = dimensions;

    if (gridRows === 0 && gridCols === 0) {
        break;
    }

    const currentGridMatrix = [];
    for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
        const rowCharacters = inputLines[currentLineIndex++].split("");
        currentGridMatrix.push(rowCharacters);
    }

    const finalOutcome = navigateGrid(0, 0, currentGridMatrix);
    console.log(finalOutcome);
}
