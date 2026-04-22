const dataAcquirer = (inputPayload) => {
    let currentLineList = inputPayload.trim().split('\n');
    let currentLineIndex = 0;

    const pullNextLine = () => {
        if (currentLineIndex >= currentLineList.length) {
            throw new Error("No more input data available.");
        }
        return currentLineList[currentLineIndex++];
    };

    return {
        extractInteger: () => parseInt(pullNextLine(), 10),
        extractStringRows: (count) => {
            const rows = [];
            for (let k = 0; k < count; k++) {
                rows.push(pullNextLine());
            }
            return rows;
        }
    };
};

function findShortestPathAndRemainingCells() {
    const dataParser = dataAcquirer(require("fs").readFileSync("/dev/stdin", "utf8"));

    const mazeRows = dataParser.extractInteger();
    const mazeCols = dataParser.extractInteger();
    const mazeLayout = dataParser.extractStringRows(mazeRows);

    let visitedDistances = Array.from({ length: mazeRows }, () => Array(mazeCols).fill(0)); // 0 for unvisited
    let totalOpenCells = 0;
    for (let r = 0; r < mazeRows; r++) {
        for (let c = 0; c < mazeCols; c++) {
            if (mazeLayout[r][c] === '.') {
                totalOpenCells++;
            }
        }
    }

    const startCoord = [0, 0];
    const endRow = mazeRows - 1;
    const endCol = mazeCols - 1;

    let pathQueue = [[startCoord[0], startCoord[1], 1]]; // [row, col, distance]
    visitedDistances[startCoord[0]][startCoord[1]] = 1; // Mark start as visited with distance 1

    const neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right

    while (pathQueue.length > 0) {
        const [currentRow, currentCol, currentPathLength] = pathQueue.shift(); // Use shift for true BFS

        if (currentRow === endRow && currentCol === endCol) {
            return totalOpenCells - currentPathLength;
        }

        for (const [dr, dc] of neighborOffsets) {
            const nextRow = currentRow + dr;
            const nextCol = currentCol + dc;

            if (nextRow >= 0 && nextRow < mazeRows &&
                nextCol >= 0 && nextCol < mazeCols &&
                mazeLayout[nextRow][nextCol] === '.' &&
                visitedDistances[nextRow][nextCol] === 0)
            {
                visitedDistances[nextRow][nextCol] = currentPathLength + 1;
                pathQueue.push([nextRow, nextCol, currentPathLength + 1]);
            }
        }
    }

    return -1; // Path not found
}

console.log(findShortestPathAndRemainingCells());