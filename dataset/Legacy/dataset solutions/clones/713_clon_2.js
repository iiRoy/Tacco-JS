var visitedGrid = [];

for (var idxA = 0; idxA < 50; idxA++) {
    visitedGrid[idxA] = [];
}

var deltaX = [1, 1, 1, 0, 0, -1, -1, -1];
var deltaY = [1, 0, -1, 1, -1, 1, 0, -1];

function exploreIsland(currentRow, currentCol, gridHeight, gridWidth, islandMap) {
    visitedGrid[currentRow][currentCol] = false;

    for (var directionIdx = 0; directionIdx < 8; directionIdx++) {
        var nextRow = currentRow + deltaX[directionIdx];
        var nextCol = currentCol + deltaY[directionIdx];
        if (nextRow >= 0 && nextRow < gridHeight && nextCol >= 0 && nextCol < gridWidth && islandMap[nextRow][nextCol] === 1 && visitedGrid[nextRow][nextCol])
            exploreIsland(nextRow, nextCol, gridHeight, gridWidth, islandMap);
    }
}

function ProcessInput(rawData) {
    rawData = rawData.split("\n");
    var inputLineIdx = 0;
    while (true) {
        rawData[inputLineIdx] = rawData[inputLineIdx].split(" ");
        var widthVal = parseInt(rawData[inputLineIdx][0], 10);
        var heightVal = parseInt(rawData[inputLineIdx++][1], 10);

        if (widthVal === 0 && heightVal === 0)
            break;

        var islandMap = [];

        for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
            islandMap[rowIdx] = [];
            rawData[inputLineIdx] = rawData[inputLineIdx].split(" ");
            for (var colIdx = 0; colIdx < widthVal; colIdx++)
                islandMap[rowIdx][colIdx] = parseInt(rawData[inputLineIdx][colIdx], 10);
            inputLineIdx++;
        }

        for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
            for (var colIdx = 0; colIdx < widthVal; colIdx++)
                visitedGrid[rowIdx][colIdx] = true;
        }
        var islandCount = 0;
        while (true) {
            var noMoreIslands = true;
            for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
                for (var colIdx = 0; colIdx < widthVal; colIdx++) {
                    if (islandMap[rowIdx][colIdx] === 1 && visitedGrid[rowIdx][colIdx]) {
                        islandCount++;
                        noMoreIslands = false;
                        exploreIsland(rowIdx, colIdx, heightVal, widthVal, islandMap);
                    }
                }
            }
            if (noMoreIslands)
                break;
        }
        console.log(islandCount);
    }
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
