class InputReader {
    constructor(inputString) {
        this.lines = inputString.trim().split('\n').map(line => line.split(' ').map(Number));
        this.currentLineIndex = 0;
        this.currentColIndex = 0;
    }

    readNumber() {
        if (this.currentLineIndex >= this.lines.length) {
            throw new Error("Input exhausted: Attempted to read past end of input.");
        }
        let currentLineValues = this.lines[this.currentLineIndex];

        if (this.currentColIndex >= currentLineValues.length) {
            this.currentLineIndex++;
            this.currentColIndex = 0;
            return this.readNumber();
        }

        const value = currentLineValues[this.currentColIndex];
        this.currentColIndex++;
        return value;
    }

    readNumbers() {
        if (this.currentLineIndex >= this.lines.length) {
            throw new Error("Input exhausted: Attempted to read past end of input.");
        }
        const lineValues = this.lines[this.currentLineIndex];
        this.currentLineIndex++;
        this.currentColIndex = 0;
        return lineValues;
    }
}

const inputProcessor = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculateMaxReachableColumn());

function calculateMaxReachableColumn() {
    const gridHeight = inputProcessor.readNumber();
    const gridWidth = inputProcessor.readNumber();
    const blockedCount = inputProcessor.readNumber();

    const blockedCells = new Map();

    for (let k = 0; k < blockedCount; k++) {
        const blockCoords = inputProcessor.readNumbers();
        const blockColumn = blockCoords[0];
        const blockRow = blockCoords[1];

        if (blockColumn < blockRow) {
            continue;
        }

        if (!blockedCells.has(blockRow)) {
            blockedCells.set(blockRow, new Set());
        }
        blockedCells.get(blockRow).add(blockColumn);
    }

    for (let rowIdx = 1; rowIdx <= gridHeight; rowIdx++) {
        if (!blockedCells.has(rowIdx)) {
            blockedCells.set(rowIdx, new Set());
        }
        blockedCells.get(rowIdx).add(gridWidth + 1);
    }

    let minReachableColumn = gridWidth;
    let currentPathColumn = 2;

    const finalState = Array.from({ length: gridHeight - 1 }, (_, index) => index + 2)
        .reduce((accumulator, currentRow) => {
            if (accumulator.currentPathColumn > accumulator.minReachableColumn) {
                return accumulator;
            }

            let tempPathColumn = accumulator.currentPathColumn;
            const rowBlockedSet = blockedCells.get(currentRow);

            if (rowBlockedSet) {
                while (rowBlockedSet.has(tempPathColumn)) {
                    tempPathColumn++;
                }
            }

            if (tempPathColumn > accumulator.minReachableColumn) {
                return { minReachableColumn: accumulator.minReachableColumn, currentPathColumn: tempPathColumn };
            }

            if (rowBlockedSet) {
                const sortedBlockedColumns = Array.from(rowBlockedSet).sort((a, b) => a - b);
                const firstRelevantBlockedCol = sortedBlockedColumns.find(col => col > tempPathColumn);

                if (firstRelevantBlockedCol !== undefined) {
                    accumulator.minReachableColumn = Math.min(accumulator.minReachableColumn, firstRelevantBlockedCol - 1);
                }
            }

            tempPathColumn++;

            return { minReachableColumn: accumulator.minReachableColumn, currentPathColumn: tempPathColumn };
        }, { minReachableColumn: minReachableColumn, currentPathColumn: currentPathColumn });

    return finalState.minReachableColumn;
}
