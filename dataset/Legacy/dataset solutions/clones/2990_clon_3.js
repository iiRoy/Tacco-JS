function processGridData(inputLinesStr) {
    const processedLines = inputLinesStr.split("\n");

    const parseGridDimensions = (dimString) => {
        const parts = dimString.split(" ");
        return {
            height: Number(parts[0]),
            width: Number(parts[1])
        };
    };

    const dimensions = parseGridDimensions(processedLines[0]);
    const gridHeight = dimensions.height;
    const gridWidth = dimensions.width;

    let currentWaveQueue = [];
    let gridState = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        const lineContent = processedLines[rowIdx + 1];
        gridState[rowIdx] = lineContent.split("");
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            if (gridState[rowIdx][colIdx] === "#") {
                currentWaveQueue.push([rowIdx, colIdx]);
            }
        }
    }

    let propagationSteps = 0;

    while (currentWaveQueue.length > 0) {
        propagationSteps++;
        let nextWaveQueue = Array.from(currentWaveQueue);

        const cellsToProcessInCurrentWave = currentWaveQueue.length;
        for (let i = 0; i < cellsToProcessInCurrentWave; i++) {
            const currentCellCoords = nextWaveQueue.shift();
            const currentRow = currentCellCoords[0];
            const currentCol = currentCellCoords[1];

            const neighborOffsets = [
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0]
            ];

            for (const [dy, dx] of neighborOffsets) {
                const neighborRow = currentRow + dy;
                const neighborCol = currentCol + dx;

                const isRowWithinBounds = neighborRow >= 0 && neighborRow < gridHeight;
                const isColWithinBounds = neighborCol >= 0 && neighborCol < gridWidth;

                if (isRowWithinBounds && isColWithinBounds) {
                    if (gridState[neighborRow][neighborCol] === ".") {
                        gridState[neighborRow][neighborCol] = "#";
                        nextWaveQueue.push([neighborRow, neighborCol]);
                    }
                }
            }
        }
        currentWaveQueue = Array.from(nextWaveQueue);
    }

    console.log(propagationSteps - 1);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
