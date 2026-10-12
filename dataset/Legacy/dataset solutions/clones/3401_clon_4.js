const createInputSource = (sourceText) => {
    const lineSegments = sourceText.trim().split('\n').map(segment => segment.split(' '));
    let currentLinePointer = 0;

    const obtainSingleItem = (asStringFlag) => {
        if (currentLinePointer >= lineSegments.length) throw new Error("Input exhausted for single item.");
        let activeLine = lineSegments[currentLinePointer];
        if (activeLine.length === 0) {
            currentLinePointer++;
            return obtainSingleItem(asStringFlag);
        }
        const extractedValue = activeLine.shift();
        if (activeLine.length === 0) {
            currentLinePointer++;
        }
        return asStringFlag ? extractedValue : Number(extractedValue);
    };

    const obtainLineItems = (asStringFlag) => {
        if (currentLinePointer >= lineSegments.length) throw new Error("Input exhausted for line items.");
        const lineContent = lineSegments[currentLinePointer];
        currentLinePointer++;
        return asStringFlag ? lineContent : lineContent.map(Number);
    };

    const obtainMultiLineMatrix = (rowCount, asStringFlag) => {
        if (currentLinePointer + rowCount > lineSegments.length) throw new Error("Insufficient lines for matrix.");
        const matrixData = lineSegments.slice(currentLinePointer, currentLinePointer + rowCount);
        currentLinePointer += rowCount;
        return asStringFlag ? matrixData : matrixData.map(row => row.map(Number));
    };

    const obtainMultiLineFlat = (rowCount, asStringFlag) => {
        if (currentLinePointer + rowCount > lineSegments.length) throw new Error("Insufficient lines for flat array.");
        const flatData = lineSegments.slice(currentLinePointer, currentLinePointer + rowCount).flat();
        currentLinePointer += rowCount;
        return asStringFlag ? flatData : flatData.map(Number);
    };

    return {
        getAtom: obtainSingleItem,
        getLine: obtainLineItems,
        getMatrix: obtainMultiLineMatrix,
        getFlat: obtainMultiLineFlat
    };
};

const inputHandler = createInputSource(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculateResult());

function calculateResult() {
    const boardHeight = inputHandler.getAtom();
    const boardWidth = inputHandler.getAtom();
    const obstacleCount = inputHandler.getAtom();

    const obstacleLocations = new Map();

    const markObstacle = (row, col) => {
        if (!obstacleLocations.has(row)) {
            obstacleLocations.set(row, new Set());
        }
        obstacleLocations.get(row).add(col);
    };

    for (let k = 0; k < obstacleCount; k++) {
        const obstacleCoords = inputHandler.getLine();
        const obstacleCol = obstacleCoords[0];
        const obstacleRow = obstacleCoords[1];
        if (obstacleCol >= obstacleRow) {
            markObstacle(obstacleRow, obstacleCol);
        }
    }

    for (let r = 1; r <= boardHeight; r++) {
        markObstacle(r, boardWidth + 1);
    }

    const rowOneObstacles = Array.from(obstacleLocations.get(1) || []).sort((a, b) => a - b);
    let currentMinimumSafeColumn = rowOneObstacles[0] - 1;

    let currentRowIdentifier = 2;
    let currentPathRightmostColumn = 2;

    while (currentRowIdentifier <= currentMinimumSafeColumn && currentRowIdentifier <= boardHeight) {
        const obstaclesInCurrentRow = obstacleLocations.get(currentRowIdentifier) || new Set();
        while (obstaclesInCurrentRow.has(currentPathRightmostColumn)) {
            currentPathRightmostColumn++;
        }

        const sortedObstaclesInCurrentRow = Array.from(obstaclesInCurrentRow).sort((a, b) => a - b);
        const nextRelevantObstacle = sortedObstaclesInCurrentRow.find(col => col > currentPathRightmostColumn);

        if (nextRelevantObstacle !== undefined) {
            currentMinimumSafeColumn = Math.min(currentMinimumSafeColumn, nextRelevantObstacle - 1);
        }

        currentPathRightmostColumn++;
        if (currentPathRightmostColumn > boardWidth) {
            break;
        }
        currentRowIdentifier++;
    }

    return currentMinimumSafeColumn;
}
