function ProcessGridData(rawData) {
    const inputLines = rawData.trim().split("\n").map(line => line.split(" "));
    const gridRows = parseInt(inputLines[0][0], 10);
    const gridCols = parseInt(inputLines[0][1], 10);

    const characterMap = [];
    for (let r = 0; r < gridRows; r++) {
        characterMap.push(inputLines[r + 1][0]);
    }

    const normalizedGrid = Array.from({ length: gridRows }, () =>
        Array.from({ length: gridCols }, () => 0)
    );

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const expectedSymbol = (r + c) % 2 === 0 ? '#' : '.';
            if (characterMap[r].charAt(c) === expectedSymbol) {
                normalizedGrid[r][c] = 1;
            } else {
                normalizedGrid[r][c] = 0;
            }
        }
    }

    const visitedTracker = Array.from({ length: gridRows }, () =>
        Array.from({ length: gridCols }, () => false)
    );

    let totalProductSum = 0;

    const rowOffsets = [-1, 1, 0, 0];
    const colOffsets = [0, 0, -1, 1];

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            if (!visitedTracker[r][c]) {
                const cellQueue = [[r, c]];
                visitedTracker[r][c] = true;

                const componentColorCounts = { 0: 0, 1: 0 };
                const initialCellColor = normalizedGrid[r][c];

                let queuePointer = 0;

                while (queuePointer < cellQueue.length) {
                    const [currentRow, currentCol] = cellQueue[queuePointer++];

                    componentColorCounts[normalizedGrid[currentRow][currentCol]]++;

                    for (let i = 0; i < 4; i++) {
                        const nextRow = currentRow + rowOffsets[i];
                        const nextCol = currentCol + colOffsets[i];

                        if (nextRow >= 0 && nextRow < gridRows &&
                            nextCol >= 0 && nextCol < gridCols &&
                            !visitedTracker[nextRow][nextCol] &&
                            normalizedGrid[nextRow][nextCol] === initialCellColor) {
                            visitedTracker[nextRow][nextCol] = true;
                            cellQueue.push([nextRow, nextCol]);
                        }
                    }
                }
                totalProductSum += componentColorCounts[0] * componentColorCounts[1];
            }
        }
    }

    console.log(totalProductSum);
}

ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
