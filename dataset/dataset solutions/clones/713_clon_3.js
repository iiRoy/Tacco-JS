let visitedGrid = Array.from({ length: 50 }, () => Array(50).fill(false));

const neighborOffsets = [
    [1, 1], [1, 0], [1, -1],
    [0, 1], [0, -1],
    [-1, 1], [-1, 0], [-1, -1]
];

function exploreIsland(rowIdx, colIdx, gridHeight, gridWidth, islandMap) {
    visitedGrid[rowIdx][colIdx] = false;

    for (const [dr, dc] of neighborOffsets) {
        const nextRow = rowIdx + dr;
        const nextCol = colIdx + dc;

        const isWithinBounds = nextRow >= 0 && nextRow < gridHeight && nextCol >= 0 && nextCol < gridWidth;
        if (!isWithinBounds) {
            continue;
        }

        const isLand = islandMap[nextRow][nextCol] === 1;
        const isNotVisited = visitedGrid[nextRow][nextCol];

        if (isLand && isNotVisited) {
            exploreIsland(nextRow, nextCol, gridHeight, gridWidth, islandMap);
        }
    }
}

function initializeVisitedStatus(h, w) {
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            visitedGrid[r][c] = true;
        }
    }
}

function findAndExploreNextIsland(gridHeight, gridWidth, islandMap, islandCounter) {
    for (let rIdx = 0; rIdx < gridHeight; rIdx++) {
        for (let cIdx = 0; cIdx < gridWidth; cIdx++) {
            if (islandMap[rIdx][cIdx] === 1 && visitedGrid[rIdx][cIdx]) {
                islandCounter.count++;
                exploreIsland(rIdx, cIdx, gridHeight, gridWidth, islandMap);
                return true;
            }
        }
    }
    return false;
}

function processInputData(rawInputData) {
    const inputLines = rawInputData.split("\n");
    let currentLineIndex = 0;

    while (true) {
        const dimensionsLine = inputLines[currentLineIndex].split(" ");
        const currentWidth = parseInt(dimensionsLine[0], 10);
        const currentHeight = parseInt(dimensionsLine[1], 10);
        currentLineIndex++;

        if (currentWidth === 0 && currentHeight === 0) {
            break;
        }

        const currentMap = [];
        for (let r = 0; r < currentHeight; r++) {
            currentMap[r] = inputLines[currentLineIndex].split(" ").map(Number);
            currentLineIndex++;
        }

        initializeVisitedStatus(currentHeight, currentWidth);

        let islandCounter = { count: 0 };
        while (findAndExploreNextIsland(currentHeight, currentWidth, currentMap, islandCounter)) {
            // Continue looping as long as new islands are found and processed
        }
        console.log(islandCounter.count);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
