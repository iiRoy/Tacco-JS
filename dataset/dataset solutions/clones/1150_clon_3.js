const outputLogger = {
    emit: (message) => console.log(message),
    error: (errMessage) => console.error("APPLICATION ERROR:", errMessage)
};

if (typeof process !== "undefined" && process.stdin && process.stdin.isTTY === false) {
    let collectedInputBuffer = "";

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (dataChunk) => {
        collectedInputBuffer += dataChunk;
    });

    process.stdin.on('end', () => {
        try {
            const processedLines = collectedInputBuffer.split("\n").filter(line => line.trim() !== '');
            if (processedLines.length === 0) {
                outputLogger.error("No input data received. Exiting.");
                return;
            }
            analyzeGridData(processedLines);
        } catch (inputErr) {
            outputLogger.error(`Error processing input stream: ${inputErr.message}`);
        }
    });
} else {
    outputLogger.emit("Application expects piped input (e.g., 'cat input.txt | node script.js').");
    outputLogger.emit("No standard input detected or TTY is active. Exiting.");
}

function isToTheRight(pointAlpha, pointBeta) {
    return pointAlpha[1] < pointBeta[1];
}

function isBelow(pointAlpha, pointBeta) {
    return pointAlpha[0] < pointBeta[0];
}

const getRightwardNeighbor = (currentPoint) => {
    return [currentPoint[0], currentPoint[1] + 1];
};

const getDownwardNeighbor = (currentPoint) => {
    return [currentPoint[0] + 1, currentPoint[1]];
};

function hasDominatingPredecessor(candidatePoint, predecessorSet) {
    for (const predecessor of predecessorSet) {
        if (candidatePoint[1] === predecessor[1]) {
            if (isBelow(predecessor, candidatePoint)) {
                return true;
            }
        } else if (candidatePoint[0] === predecessor[0]) {
            if (isToTheRight(predecessor, candidatePoint)) {
                return true;
            }
        }
    }
    return false;
}

function analyzeGridData(rawLineData) {
    let gridDimensions = [];
    try {
        gridDimensions = rawLineData.shift().trim().split(" ").map(valStr => parseInt(valStr, 10));
        if (gridDimensions.length !== 2 || isNaN(gridDimensions[0]) || isNaN(gridDimensions[1])) {
            throw new Error("Invalid grid dimensions provided. Expected two numbers.");
        }
    } catch (parseError) {
        outputLogger.error(`Failed to parse grid dimensions: ${parseError.message}`);
        return;
    }

    const totalRows = gridDimensions[0];
    const totalCols = gridDimensions[1];

    if (totalRows <= 0 || totalCols <= 0) {
        outputLogger.emit(`Grid dimensions must be positive (Rows: ${totalRows}, Cols: ${totalCols}). Exiting.`);
        return;
    }

    const numericGrid = rawLineData.map(lineStr =>
        lineStr.trim().split(" ").map(numChar => {
            const parsedNum = parseInt(numChar, 10);
            if (isNaN(parsedNum) || (parsedNum !== 0 && parsedNum !== 1)) {
                outputLogger.error(`Invalid grid cell value '${numChar}'. Expected 0 or 1. Defaulting to 1.`);
                return 1;
            }
            return parsedNum;
        })
    );

    if (numericGrid.length !== totalRows || (totalRows > 0 && numericGrid[0].length !== totalCols)) {
        outputLogger.error(`Input grid size mismatch. Expected ${totalRows}x${totalCols}, got ${numericGrid.length}x${(numericGrid.length > 0 ? numericGrid[0].length : 0)}. Exiting.`);
        return;
    }

    let overallMaxArea = 0;

    const lastZeroRowIndex = Array.from({ length: totalRows }, () => Array(totalCols).fill(-1));
    const lastZeroColIndex = Array.from({ length: totalRows }, () => Array(totalCols).fill(-1));
    const currentDominantOrigins = Array.from({ length: totalRows }, () => Array(totalCols).fill(null));

    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
            const cellValue = numericGrid[r][c];

            const prevZeroRowCoord = (r === 0) ? -1 : lastZeroRowIndex[r - 1][c];
            const prevZeroColCoord = (c === 0) ? -1 : lastZeroColIndex[r][c - 1];
            const prevDominantSet = (r === 0 || c === 0) ? [] : currentDominantOrigins[r - 1][c - 1];

            let cellDominantOrigins = [];
            let cellLastZeroRow = r;
            let cellLastZeroCol = c;

            if (cellValue === 0) {
                cellLastZeroRow = prevZeroRowCoord;
                cellLastZeroCol = prevZeroColCoord;

                const candidatePointX = [prevZeroRowCoord, c];
                const candidatePointY = [r, prevZeroColCoord];

                cellDominantOrigins = prevDominantSet.map(prevOrigin => {
                    if (!isToTheRight(candidatePointY, prevOrigin)) {
                        return [prevOrigin[0], prevZeroColCoord + 1];
                    }
                    if (!isBelow(candidatePointX, prevOrigin)) {
                        return [prevZeroRowCoord + 1, prevOrigin[1]];
                    }
                    return prevOrigin;
                });

                cellDominantOrigins.push(getRightwardNeighbor(candidatePointY));
                cellDominantOrigins.push(getDownwardNeighbor(candidatePointX));

                cellDominantOrigins = cellDominantOrigins.filter(origin =>
                    !hasDominatingPredecessor(origin, cellDominantOrigins)
                );

                const uniqueOriginsSet = new Set();
                cellDominantOrigins = cellDominantOrigins.filter(origin => {
                    const originKey = `${origin[0]},${origin[1]}`;
                    if (uniqueOriginsSet.has(originKey)) {
                        return false;
                    }
                    uniqueOriginsSet.add(originKey);
                    return true;
                });

            } else {
                cellLastZeroRow = r;
                cellLastZeroCol = c;
                cellDominantOrigins = [];
            }

            currentDominantOrigins[r][c] = cellDominantOrigins;
            lastZeroRowIndex[r][c] = cellLastZeroRow;
            lastZeroColIndex[r][c] = cellLastZeroCol;

            let currentCellAreas = [0];
            if (cellDominantOrigins.length > 0) {
                cellDominantOrigins.forEach(originPoint => {
                    const rectangleHeight = r - originPoint[0] + 1;
                    const rectangleWidth = c - originPoint[1] + 1;
                    if (rectangleHeight > 0 && rectangleWidth > 0) {
                        currentCellAreas.push(rectangleHeight * rectangleWidth);
                    }
                });
            }

            const maxAreaAtCurrentCell = Math.max(...currentCellAreas);
            if (maxAreaAtCurrentCell > overallMaxArea) {
                overallMaxArea = maxAreaAtCurrentCell;
            }
        }
    }
    outputLogger.emit(overallMaxArea);
}