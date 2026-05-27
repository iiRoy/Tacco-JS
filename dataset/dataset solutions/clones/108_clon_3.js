const fileSystem = require('fs');

function readStdinContent() {
    const fileDescriptor = process.stdin.fd;
    const fileStats = fileSystem.fstatSync(fileDescriptor);
    const contentSize = fileStats.size;

    if (contentSize === 0) {
        return [''];
    }

    const dataBuffer = Buffer.alloc(contentSize);
    const readBytesCount = fileSystem.readSync(fileDescriptor, dataBuffer, 0, contentSize, 0);
    const rawContent = dataBuffer.toString('utf8', 0, readBytesCount);
    return rawContent.split('\n');
}

function createZeroGrid(rows, cols) {
    const grid = [];
    for (let r = 0; r < rows; r++) {
        grid.push(new Array(cols).fill(0));
    }
    return grid;
}

function findMax(val1, val2) {
    return Math.max(val1, val2);
}

function processData() {
    const processedLines = readStdinContent();

    const gridMatrixRows = 14;
    const gridMatrixCols = 14;
    const gridMatrix = createZeroGrid(gridMatrixRows, gridMatrixCols);

    const totalLines = processedLines.length;
    for (let lineIndex = totalLines - 2; lineIndex >= 0; lineIndex--) {
        const currentLine = processedLines[lineIndex];
        const coordX = parseInt(currentLine[0], 10) + 2;
        const coordY = parseInt(currentLine[2], 10) + 2;
        const operationType = currentLine[4];

        switch (operationType) {
            case '3':
                gridMatrix[coordY + 2][coordX]++;
                gridMatrix[coordY - 2][coordX]++;
                gridMatrix[coordY][coordX - 2]++;
                gridMatrix[coordY][coordX + 2]++;
            // FALLTHROUGH
            case '2':
                gridMatrix[coordY + 1][coordX - 1]++;
                gridMatrix[coordY + 1][coordX + 1]++;
                gridMatrix[coordY - 1][coordX - 1]++;
                gridMatrix[coordY - 1][coordX + 1]++;
            // FALLTHROUGH
            case '1':
                gridMatrix[coordY + 1][coordX]++;
                gridMatrix[coordY][coordX - 1]++;
                gridMatrix[coordY][coordX]++;
                gridMatrix[coordY][coordX + 1]++;
                gridMatrix[coordY - 1][coordX]++;
                break;
        }
    }

    let notDroppedCount = 0;
    let maxDroppedCount = 0;

    const loopLimit = 10;
    for (let rowIter = 0; rowIter < loopLimit; rowIter++) {
        for (let colIter = 0; colIter < loopLimit; colIter++) {
            const currentGridValue = gridMatrix[rowIter + 2][colIter + 2];
            if (currentGridValue === 0) {
                notDroppedCount++;
            }
            maxDroppedCount = findMax(currentGridValue, maxDroppedCount);
        }
    }

    console.log(notDroppedCount);
    console.log(maxDroppedCount);
}

processData();
