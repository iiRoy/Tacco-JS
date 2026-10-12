const getStandardInput = require('fs').readFileSync;
const processedLines = (getStandardInput('/dev/stdin', 'utf8').trim()).split("\n");

let currentLineIndex = 0;

while (true) {
    const dimensions = processedLines[currentLineIndex++].split(" ").map(Number);
    const [rowCount, colCount] = dimensions;

    if (rowCount === 0 && colCount === 0) {
        break;
    }

    const gridMap = [];
    for (let r = 0; r < rowCount; r++) {
        gridMap.push(processedLines[currentLineIndex++].split(""));
    }

    let distinctBombClusters = 0;
    const cardinalDirections = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // [deltaRow, deltaCol]

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            const initialCellValue = gridMap[r][c];

            if (initialCellValue === "@" || initialCellValue === "#" || initialCellValue === "*") {
                distinctBombClusters++;

                const cellsToPropagate = [[r, c]]; // BFS queue
                let cellsModifiedInCluster = 0; // Tracks processed cells, mimicking original's CNT
                let queuePointer = 0; // Manual queue head for performance

                // Mark the starting cell and count it as processed
                gridMap[r][c] = "m";
                cellsModifiedInCluster++;

                // Perform Breadth-First Search (BFS) to clear connected cells
                while (queuePointer < cellsToPropagate.length && cellsModifiedInCluster < 50) {
                    const [currentRow, currentCol] = cellsToPropagate[queuePointer++];

                    for (const [dr, dc] of cardinalDirections) {
                        const nextRow = currentRow + dr;
                        const nextCol = currentCol + dc;

                        // Check boundary conditions
                        if (nextRow >= 0 && nextRow < rowCount && nextCol >= 0 && nextCol < colCount) {
                            // If the neighbor cell matches the original cluster value
                            // and we haven't hit the processing limit for this cluster
                            if (gridMap[nextRow][nextCol] === initialCellValue) {
                                if (cellsModifiedInCluster < 50) {
                                    gridMap[nextRow][nextCol] = 0; // Mark as cleared
                                    cellsToPropagate.push([nextRow, nextCol]); // Add to queue
                                    cellsModifiedInCluster++; // Increment processed count
                                }
                                // If cellsModifiedInCluster is 50, we stop expanding from this path,
                                // effectively mimicking the original's recursion limit.
                            }
                        }
                    }
                }
            }
        }
    }
    console.log(distinctBombClusters);
}
