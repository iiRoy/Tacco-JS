const GRID_HEIGHT = 12;
const GRID_WIDTH = 6;
const DIRECTION_COUNT = 4;
const MIN_CHAIN_LENGTH = 4;
const EMPTY_SPACE_MARKER = ".";
const ZERO_INDEX = 0;
const NEG_ONE = -1;

function chainReaction(rowCoord, colCoord, blockType) {
    const rowOffsets = [NEG_ONE, ZERO_INDEX, ZERO_INDEX, 1];
    const colOffsets = [ZERO_INDEX, NEG_ONE, 1, ZERO_INDEX];

    for (let idx = ZERO_INDEX; idx < DIRECTION_COUNT; idx++) {
        let nextRow = rowCoord + rowOffsets[idx];
        let nextCol = colCoord + colOffsets[idx];

        if (nextRow < ZERO_INDEX || nextCol < ZERO_INDEX || nextRow >= GRID_HEIGHT || nextCol >= GRID_WIDTH) {
            continue;
        }

        if (gridMatrix[nextRow][nextCol] === blockType) {
            groupCount++;
            if (groupCount === MIN_CHAIN_LENGTH) {
                matchedClusters.push([nextRow, nextCol]);
            }
            gridMatrix[nextRow][nextCol] = blockType + groupCount;
            chainReaction(nextRow, nextCol, blockType);
        }
    }
}

function clearAffected(rowCoord, colCoord, blockType) {
    const rowOffsets = [NEG_ONE, ZERO_INDEX, ZERO_INDEX, 1];
    const colOffsets = [ZERO_INDEX, NEG_ONE, 1, ZERO_INDEX];

    for (let idx = ZERO_INDEX; idx < DIRECTION_COUNT; idx++) {
        let nextRow = rowCoord + rowOffsets[idx];
        let nextCol = colCoord + colOffsets[idx];

        if (nextRow < ZERO_INDEX || nextCol < ZERO_INDEX || nextRow >= GRID_HEIGHT || nextCol >= GRID_WIDTH) {
            continue;
        }

        if (gridMatrix[nextRow][nextCol] === blockType) {
            gridMatrix[nextRow][nextCol] = EMPTY_SPACE_MARKER;
            clearAffected(nextRow, nextCol, blockType);
        } else if (gridMatrix[nextRow][nextCol] === "O") {
            gridMatrix[nextRow][nextCol] = EMPTY_SPACE_MARKER;
        }
    }
}

function shiftBlock(currentY, currentX) {
    let checkY = currentY;
    while (currentY > ZERO_INDEX) {
        currentY--;
        if (gridMatrix[currentY][currentX] !== EMPTY_SPACE_MARKER) {
            gridMatrix[checkY][currentX] = gridMatrix[currentY][currentX];
            gridMatrix[currentY][currentX] = EMPTY_SPACE_MARKER;
            break;
        }
    }
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineArray = (rawData.trim()).split("\n");
let numCases = lineArray.shift() - ZERO_INDEX;

for (let caseIndex = ZERO_INDEX; caseIndex < numCases; caseIndex++) {
    let gridMatrix = [];
    for (let rowIndex = ZERO_INDEX; rowIndex < GRID_HEIGHT; rowIndex++) {
        let rowChars = (lineArray.shift()).split("");
        gridMatrix.push(rowChars);
    }

    let scoreTotal = ZERO_INDEX;
    while (true) {
        let matchedClusters = [];
        let groupCount;

        for (let rowIndex = ZERO_INDEX; rowIndex < GRID_HEIGHT; rowIndex++) {
            for (let colIndex = ZERO_INDEX; colIndex < GRID_WIDTH; colIndex++) {
                if (gridMatrix[rowIndex][colIndex] === "R") {
                    groupCount = 1;
                    gridMatrix[rowIndex][colIndex] = "R" + groupCount;
                    chainReaction(rowIndex, colIndex, "R");
                }
                if (gridMatrix[rowIndex][colIndex] === "G") {
                    groupCount = 1;
                    gridMatrix[rowIndex][colIndex] = "G" + groupCount;
                    chainReaction(rowIndex, colIndex, "G");
                }
                if (gridMatrix[rowIndex][colIndex] === "B") {
                    groupCount = 1;
                    gridMatrix[rowIndex][colIndex] = "B" + groupCount;
                    chainReaction(rowIndex, colIndex, "B");
                }
                if (gridMatrix[rowIndex][colIndex] === "Y") {
                    groupCount = 1;
                    gridMatrix[rowIndex][colIndex] = "Y" + groupCount;
                    chainReaction(rowIndex, colIndex, "Y");
                }
                if (gridMatrix[rowIndex][colIndex] === "P") {
                    groupCount = 1;
                    gridMatrix[rowIndex][colIndex] = "P" + groupCount;
                    chainReaction(rowIndex, colIndex, "P");
                }
            }
        }

        for (let rowIndex = ZERO_INDEX; rowIndex < GRID_HEIGHT; rowIndex++) {
            for (let colIndex = ZERO_INDEX; colIndex < GRID_WIDTH; colIndex++) {
                gridMatrix[rowIndex][colIndex] = gridMatrix[rowIndex][colIndex].slice(ZERO_INDEX, 1);
            }
        }

        if (matchedClusters.length === ZERO_INDEX) {
            break;
        }

        scoreTotal++;
        matchedClusters.forEach(function(clusterEntry) {
            let rCoord = clusterEntry[ZERO_INDEX];
            let cCoord = clusterEntry[1];
            let blockValue = gridMatrix[rCoord][cCoord];
            clearAffected(rCoord, cCoord, blockValue);
        });

        for (let rowIndex = GRID_HEIGHT - 1; rowIndex > ZERO_INDEX; rowIndex--) {
            for (let colIndex = ZERO_INDEX; colIndex < GRID_WIDTH; colIndex++) {
                if (gridMatrix[rowIndex][colIndex] === EMPTY_SPACE_MARKER) {
                    shiftBlock(rowIndex, colIndex);
                }
            }
        }
    }
    console.log(scoreTotal);
}