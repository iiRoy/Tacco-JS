let rawInputBuffer = '';

function processInputData(inputLines) {
    const GRID_DIMENSION = 14;

    let gridMatrix = Array.from({ length: GRID_DIMENSION }, () =>
        Array.from({ length: GRID_DIMENSION }, () => 0)
    );

    function getAdjustedCoordinate(charValue) {
        return parseInt(charValue) + 2;
    }

    function applyLevel1Increments(matrix, r, c) {
        matrix[r + 1][c]++;
        matrix[r][c - 1]++;
        matrix[r][c]++;
        matrix[r][c + 1]++;
        matrix[r - 1][c]++;
    }

    function applyLevel2Increments(matrix, r, c) {
        matrix[r + 1][c - 1]++;
        matrix[r + 1][c + 1]++;
        matrix[r - 1][c - 1]++;
        matrix[r - 1][c + 1]++;
    }

    function applyLevel3Increments(matrix, r, c) {
        matrix[r + 2][c]++;
        matrix[r - 2][c]++;
        matrix[r][c - 2]++;
        matrix[r][c + 2]++;
    }

    for (let lineIndex = inputLines.length - 1; lineIndex > 0; lineIndex--) {
        const currentLine = inputLines[lineIndex];
        const currentCol = getAdjustedCoordinate(currentLine[0]);
        const currentRow = getAdjustedCoordinate(currentLine[2]);
        const currentLineType = currentLine[4];

        switch (currentLineType) {
            case '3':
                applyLevel3Increments(gridMatrix, currentRow, currentCol);
            case '2':
                applyLevel2Increments(gridMatrix, currentRow, currentCol);
            case '1':
                applyLevel1Increments(gridMatrix, currentRow, currentCol);
                break;
        }
    }

    const INNER_GRID_SIZE = 10;
    const GRID_OFFSET = 2;

    let zeroCount = 0;
    let maxCellValue = 0;

    for (let rowIter = 0; rowIter < INNER_GRID_SIZE; rowIter++) {
        for (let colIter = 0; colIter < INNER_GRID_SIZE; colIter++) {
            const cellValue = gridMatrix[rowIter + GRID_OFFSET][colIter + GRID_OFFSET];
            if (cellValue === 0) {
                zeroCount++;
            }
            maxCellValue = findMaximum(cellValue, maxCellValue);
        }
    }

    console.log(zeroCount);
    console.log(maxCellValue);
}

function findMaximum(valA, valB) {
    const difference = valA - valB;
    return valA - (difference & (difference >> 31));
}

function initializeInputHandler() {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawInputBuffer += chunk;
    });
    process.stdin.on('end', () => {
        const inputLines = rawInputBuffer.split('\n');
        processInputData(inputLines);
    });
}

initializeInputHandler();
