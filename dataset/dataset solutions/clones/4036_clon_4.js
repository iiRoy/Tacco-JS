class InputReader {
    constructor(rawInputContent) {
        this.lineSegments = rawInputContent.trim().split('\n');
        this.currentLineIndex = 0;
        this.currentLineTokens = [];
        this.currentTokenIndex = 0;
    }

    _advanceTokenPointer() {
        if (this.currentTokenIndex >= this.currentLineTokens.length) {
            if (this.currentLineIndex >= this.lineSegments.length) {
                throw new Error("Input exhausted: No more lines to read.");
            }
            this.currentLineTokens = this.lineSegments[this.currentLineIndex].split(' ');
            this.currentTokenIndex = 0;
            this.currentLineIndex++;
        }
    }

    readToken() {
        this._advanceTokenPointer();
        return this.currentLineTokens[this.currentTokenIndex++];
    }

    readNum() {
        return Number(this.readToken());
    }

    readLineString() {
        if (this.currentLineIndex >= this.lineSegments.length) {
            throw new Error("Input exhausted: No more lines to read.");
        }
        return this.lineSegments[this.currentLineIndex++];
    }

    readRawLines(count) {
        const collectedLines = [];
        for (let i = 0; i < count; i++) {
            collectedLines.push(this.readLineString());
        }
        return collectedLines;
    }
}

console.log(processMaze());

function processMaze() {
    const inputSource = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

    const mazeHeight = inputSource.readNum();
    const mazeWidth = inputSource.readNum();
    const mazeGrid = inputSource.readRawLines(mazeHeight);

    let totalTraversableCells = 0;
    mazeGrid.forEach(rowString => {
        Array.from(rowString).forEach(char => {
            if (char === '.') {
                totalTraversableCells++;
            }
        });
    });

    const startRow = 0;
    const startCol = 0;
    const targetRow = mazeHeight - 1;
    const targetCol = mazeWidth - 1;

    if (mazeGrid[startRow][startCol] === '#') {
        return -1;
    }

    const visitedStatus = Array.from({ length: mazeHeight }, () => Array(mazeWidth).fill(false));
    const searchQueue = [];

    searchQueue.push({ r: startRow, c: startCol, distance: 1 });
    visitedStatus[startRow][startCol] = true;

    const rowDelta = [-1, 1, 0, 0];
    const colDelta = [0, 0, -1, 1];

    while (searchQueue.length > 0) {
        const { r: currentRow, c: currentCol, distance: currentPathLength } = searchQueue.shift();

        if (currentRow === targetRow && currentCol === targetCol) {
            return totalTraversableCells - currentPathLength;
        }

        for (let i = 0; i < 4; i++) {
            const nextRow = currentRow + rowDelta[i];
            const nextCol = currentCol + colDelta[i];

            if (nextRow >= 0 && nextRow < mazeHeight && nextCol >= 0 && nextCol < mazeWidth) {
                if (!visitedStatus[nextRow][nextCol] && mazeGrid[nextRow][nextCol] === '.') {
                    visitedStatus[nextRow][nextCol] = true;
                    searchQueue.push({ r: nextRow, c: nextCol, distance: currentPathLength + 1 });
                }
            }
        }
    }

    return -1;
}
