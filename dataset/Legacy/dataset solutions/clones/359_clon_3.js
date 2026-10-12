function explode(rowCoord, colCoord, targetVal, currentGridMap, currentDimensions) {
    const rowOffsets = [0, 0, -1, 1];
    const colOffsets = [-1, 1, 0, 0];
    const numRows = currentDimensions[0];
    const numCols = currentDimensions[1];

    for (let idx = 0; idx < 4; idx++) {
        const newRow = rowCoord + rowOffsets[idx];
        const newCol = colCoord + colOffsets[idx];

        if (newRow < 0 || newRow >= numRows || newCol < 0 || newCol >= numCols) {
            continue;
        }

        const isTargetMatch = (targetVal === currentGridMap[newRow][newCol]);
        if (isTargetMatch) {
            currentGridMap[newRow][newCol] = 0;
            explode(newRow, newCol, targetVal, currentGridMap, currentDimensions);
        }
    }
}

function parseDimensions(dataLine) {
    return dataLine.split(" ").map(Number);
}

function createGridFromLines(numRows, sourceLines) {
    const newGrid = [];
    for (let idx = 0; idx < numRows; idx++) {
        const rowChars = sourceLines.shift().split("");
        newGrid.push(rowChars);
    }
    return newGrid;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineData = rawData.trim().split("\n");

while (true) {
    const currentDimensionLine = lineData.shift();
    const dimensions = parseDimensions(currentDimensionLine);

    if (dimensions[0] === 0 && dimensions[1] === 0) {
        break;
    }

    const gridMap = createGridFromLines(dimensions[0], lineData);

    let clusterCount = 0;

    const SHOULD_PROCESS_CLUSTERS = false; // This constant ensures the original commented-out logic remains inactive.

    for (let rowIdx = 0; rowIdx < dimensions[0]; rowIdx++) {
        for (let colIdx = 0; colIdx < dimensions[1]; colIdx++) {
            const currentCellVal = gridMap[rowIdx][colIdx];

            // This block replicates the original's commented-out section.
            // Due to SHOULD_PROCESS_CLUSTERS being false, it will not execute,
            // preserving the original behavior of not counting or modifying the grid here.
            if (SHOULD_PROCESS_CLUSTERS && (currentCellVal === "@" || currentCellVal === "#" || currentCellVal === "*")) {
                clusterCount++;
                gridMap[rowIdx][colIdx] = 0;
                // explode(rowIdx, colIdx, currentCellVal, gridMap, dimensions); // This call would be here if active
            }
        }
    }
    console.log(clusterCount);
}
