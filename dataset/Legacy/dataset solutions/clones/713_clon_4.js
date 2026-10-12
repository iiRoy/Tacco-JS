const neighborDeltas = [
    [1, 1], [1, 0], [1, -1],
    [0, 1],         [0, -1],
    [-1, 1], [-1, 0], [-1, -1]
];

function exploreConnectedLand(startRow, startCol, gridHeight, gridWidth, terrainMap) {
    const traversalQueue = [[startRow, startCol]];
    terrainMap[startRow][startCol] = 0;

    let queuePointer = 0;
    while (queuePointer < traversalQueue.length) {
        const [currentRow, currentCol] = traversalQueue[queuePointer++];

        for (const [deltaR, deltaC] of neighborDeltas) {
            const nextRow = currentRow + deltaR;
            const nextCol = currentCol + deltaC;

            if (nextRow >= 0 && nextRow < gridHeight &&
                nextCol >= 0 && nextCol < gridWidth &&
                terrainMap[nextRow][nextCol] === 1) {
                terrainMap[nextRow][nextCol] = 0;
                traversalQueue.push([nextRow, nextCol]);
            }
        }
    }
}

function processIslandMaps(inputData) {
    const inputLines = inputData.split('\n');
    let currentLineIndex = 0;

    while (true) {
        const dimensions = inputLines[currentLineIndex].split(' ').map(Number);
        const gridWidth = dimensions[0];
        const gridHeight = dimensions[1];

        if (gridWidth === 0 && gridHeight === 0) {
            break;
        }

        const currentTerrainMap = Array.from({ length: gridHeight }, (_, rIdx) =>
            inputLines[currentLineIndex + rIdx + 1].split(' ').map(Number)
        );
        currentLineIndex += gridHeight + 1;

        let islandCounter = 0;
        for (let r = 0; r < gridHeight; r++) {
            for (let c = 0; c < gridWidth; c++) {
                if (currentTerrainMap[r][c] === 1) {
                    islandCounter++;
                    exploreConnectedLand(r, c, gridHeight, gridWidth, currentTerrainMap);
                }
            }
        }
        console.log(islandCounter);
    }
}

processIslandMaps(require("fs").readFileSync("/dev/stdin", "utf8"));
