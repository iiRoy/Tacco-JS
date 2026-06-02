class InputParser {
    constructor(sourceString) {
        this._sourceLines = sourceString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    _parseValue(value, asString) {
        return asString ? value : Number(value);
    }

    readSingleReversedItem(asString = false) {
        let currentLineArray = this._sourceLines[this._currentLineIndex];
        if (typeof currentLineArray === "string") {
            currentLineArray = currentLineArray.split(" ").reverse();
            this._sourceLines[this._currentLineIndex] = currentLineArray;
        }
        const item = currentLineArray.pop();
        if (!currentLineArray.length) {
            this._currentLineIndex++;
        }
        return this._parseValue(item, asString);
    }

    readLineItems(asString = false) {
        const line = this._sourceLines[this._currentLineIndex++].split(" ");
        return asString ? line : line.map(Number);
    }

    readMatrix(numRows, asString = false) {
        const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
        this._currentLineIndex += numRows;
        return asString ? matrixRows.map(row => row.split(" ")) : matrixRows.map(row => row.split(" ").map(Number));
    }

    readRawLines(numRows, asString = false) {
        const lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
        this._currentLineIndex += numRows;
        return asString ? lines : lines.map(Number);
    }
}

const createInputParser = (source) => new InputParser(source);

const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveProblem());

function findFirstUnblockedColumn(row, startColumn, gridData) {
    let currentColumn = startColumn;
    while (gridData[row][currentColumn]) {
        currentColumn++;
    }
    return currentColumn;
}

function solveProblem() {
    const height = inputReader.readSingleReversedItem();
    const width = inputReader.readSingleReversedItem();
    const numObstacles = inputReader.readSingleReversedItem();

    const blockedCells = Array.from({ length: height + 1 }, () => ({}));

    for (let obstacleIndex = 0; obstacleIndex < numObstacles; obstacleIndex++) {
        const obstacleCoordinates = inputReader.readLineItems();
        const obstacleCol = obstacleCoordinates[0];
        const obstacleRow = obstacleCoordinates[1];

        if (obstacleCol < obstacleRow) {
            continue;
        }
        blockedCells[obstacleRow][obstacleCol] = true;
    }

    const boundaryColumn = width + 1;
    for (let rowIndex = 1; rowIndex <= height; rowIndex++) {
        blockedCells[rowIndex][boundaryColumn] = true;
    }

    let minSafeColumn = Number(Object.keys(blockedCells[1])[0]) - 1;
    let currentSearchColumn = 2;

    for (let currentRow = 2; currentRow <= height; currentRow++) {
        currentSearchColumn = findFirstUnblockedColumn(currentRow, currentSearchColumn, blockedCells);

        if (currentSearchColumn > minSafeColumn) {
            break;
        }

        const currentRowBlockedCols = blockedCells[currentRow];
        for (const colKeyString in currentRowBlockedCols) {
            const blockedColumn = Number(colKeyString);
            if (currentSearchColumn < blockedColumn) {
                const potentialMin = blockedColumn - 1;
                if (potentialMin < minSafeColumn) {
                    minSafeColumn = potentialMin;
                }
                break;
            }
        }
        currentSearchColumn++;
    }

    return minSafeColumn;
}
