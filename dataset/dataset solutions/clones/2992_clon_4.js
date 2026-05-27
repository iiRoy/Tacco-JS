const fileSystem = require("fs");

module.exports = function(inputData) {

    const parseGridData = (dataString) => {
        const lineSegments = dataString.split("\n");
        const dimensionParts = lineSegments[0].split(" ");
        const rowCount = Number(dimensionParts[0]);
        const colCount = Number(dimensionParts[1]);

        const charMatrix = [];
        for (let rIdx = 0; rIdx < rowCount; rIdx++) {
            charMatrix.push(lineSegments[rIdx + 1].split(""));
        }
        return { rowCount, colCount, charMatrix };
    };

    const setupBFS = (rows, cols, charMap) => {
        const distanceGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
        const bfsQueue = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (charMap[r][c] === '#') {
                    distanceGrid[r][c] = 0;
                    bfsQueue.push([r, c, 0]);
                }
            }
        }
        return { distanceGrid, bfsQueue };
    };

    const performBFS = (rows, cols, distsMap, initialQueue) => {
        let maxReachedDistance = 0;
        let queuePointer = 0;

        const rowOffsets = [-1, 1, 0, 0];
        const colOffsets = [0, 0, -1, 1];

        while (queuePointer < initialQueue.length) {
            const [currentRow, currentCol, currentDistance] = initialQueue[queuePointer++];

            maxReachedDistance = Math.max(maxReachedDistance, currentDistance);

            for (let k = 0; k < 4; k++) {
                const nextRow = currentRow + rowOffsets[k];
                const nextCol = currentCol + colOffsets[k];

                if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
                    if (distsMap[nextRow][nextCol] === null) {
                        distsMap[nextRow][nextCol] = currentDistance + 1;
                        initialQueue.push([nextRow, nextCol, currentDistance + 1]);
                    }
                }
            }
        }
        return maxReachedDistance;
    };

    const { rowCount, colCount, charMatrix } = parseGridData(inputData);
    const { distanceGrid, bfsQueue } = setupBFS(rowCount, colCount, charMatrix);
    const resultDistance = performBFS(rowCount, colCount, distanceGrid, bfsQueue);

    console.log(resultDistance);
};

module.exports(fileSystem.readFileSync("/dev/stdin", "UTF-8"));
