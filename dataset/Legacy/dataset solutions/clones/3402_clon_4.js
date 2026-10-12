const createInputProcessor = (sourceText) => {
    let sourceLines = sourceText.trim().split('\n');
    let linePointer = 0;
    let currentLineSegments = [];

    const ensureSegments = () => {
        if (currentLineSegments.length === 0 && linePointer < sourceLines.length) {
            currentLineSegments = sourceLines[linePointer].split(' ').reverse();
            linePointer++;
        }
    };

    const extractValue = (asStringFlag) => {
        ensureSegments();
        const segment = currentLineSegments.pop();
        return asStringFlag ? segment : Number(segment);
    };

    const retrieveLine = (asStringFlag) => {
        if (linePointer >= sourceLines.length) return [];
        const segments = sourceLines[linePointer].split(' ');
        linePointer++;
        return asStringFlag ? segments : segments.map(Number);
    };

    const retrieveMatrix = (numRows, asStringFlag) => {
        const collectedRows = [];
        for (let k = 0; k < numRows; k++) {
            if (linePointer >= sourceLines.length) break;
            const segments = sourceLines[linePointer].split(' ');
            collectedRows.push(asStringFlag ? segments : segments.map(Number));
            linePointer++;
        }
        return collectedRows;
    };

    const retrieveRawRows = (numRows, asStringFlag) => {
        const collectedRows = [];
        for (let k = 0; k < numRows; k++) {
            if (linePointer >= sourceLines.length) break;
            const lineContent = sourceLines[linePointer];
            collectedRows.push(asStringFlag ? lineContent : Number(lineContent));
            linePointer++;
        }
        return collectedRows;
    };

    return {
        extractValue,
        retrieveLine,
        retrieveMatrix,
        retrieveRawRows,
    };
};

function calculateMaxPath() {
    const hgt = inputReader.extractValue();
    const wid = inputReader.extractValue();
    const blockCount = inputReader.extractValue();

    const occupiedPositions = new Map();

    const markOccupied = (rowCoord, colCoord) => {
        if (!occupiedPositions.has(rowCoord)) {
            occupiedPositions.set(rowCoord, new Set());
        }
        occupiedPositions.get(rowCoord).add(colCoord);
    };

    Array.from({ length: blockCount }).forEach(() => {
        const blockCoords = inputReader.retrieveLine();
        const [colVal, rowVal] = blockCoords;
        if (colVal >= rowVal) {
            markOccupied(rowVal, colVal);
        }
    });

    Array.from({ length: hgt }, (_, rIdx) => rIdx + 1).forEach(rowNum => {
        markOccupied(rowNum, wid + 1);
    });

    const rowOneOccupied = occupiedPositions.get(1);
    let currentMaxReachable = rowOneOccupied
        ? Math.min(...Array.from(rowOneOccupied)) - 1
        : wid;

    const finalState = Array.from({ length: hgt - 1 }, (_, rIdx) => rIdx + 2)
        .reduce(([prevMax, prevCursor], currentRow) => {
            if (prevCursor >= wid || currentRow > prevMax) {
                return [prevMax, prevCursor];
            }

            let currentCursor = prevCursor;
            const rowBlocks = occupiedPositions.get(currentRow) || new Set();

            while (rowBlocks.has(currentCursor)) {
                currentCursor++;
            }

            let nextBlockColumn = Infinity;
            for (const blockedCol of rowBlocks) {
                if (blockedCol >= currentCursor) {
                    nextBlockColumn = Math.min(nextBlockColumn, blockedCol);
                }
            }

            const newMaxReachable = Math.min(prevMax, nextBlockColumn - 1);

            const nextCursor = currentCursor + 1;

            return [newMaxReachable, nextCursor];
        }, [currentMaxReachable, 2]);

    return finalState[0];
}

const inputReader = createInputProcessor(require("fs").readFileSync("/dev/stdin","utf8"));
console.log(calculateMaxPath());
