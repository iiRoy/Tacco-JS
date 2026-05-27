function parseNumericLine(inputLine) {
    return inputLine.split(" ").map(Number);
}

function createInitialized2DArray(numRows, numCols, initialVal) {
    var newArray = [];
    for (var r = 0; r < numRows; r++) {
        newArray[r] = new Array(numCols).fill(initialVal);
    }
    return newArray;
}

function getPathValueFromPrevious(dpMatrix, gridMatrix, r, c, currentWidth) {
    if (r < 0 || c < 0 || c >= currentWidth) {
        return 0;
    }
    if (gridMatrix[r][c] === 2) {
        return 0;
    }
    return dpMatrix[r][c];
}

function shouldCellContributeToTotal(r, h, currentGridVal) {
    var secondToLastRow = h - 2;
    var lastRow = h - 1;

    if (r === secondToLastRow && currentGridVal === 2) {
        return true;
    }
    if (r === lastRow && (currentGridVal === 0 || currentGridVal === 2)) {
        return true;
    }
    return false;
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = rawData.trim().split("\n");

const CELL_TYPE_EMPTY = 0;
const CELL_TYPE_BLOCKED_1 = 1;
const CELL_TYPE_SPECIAL_2 = 2;

while (true) {
    var [width, height] = parseNumericLine(lineData.shift());

    if (width === CELL_TYPE_EMPTY && height === CELL_TYPE_EMPTY) {
        break;
    }

    var gridValues = [];
    for (var rowIdx = 0; rowIdx < height; rowIdx++) {
        gridValues.push(parseNumericLine(lineData.shift()));
    }

    var dynamicProg = createInitialized2DArray(height, width, CELL_TYPE_EMPTY);

    for (var rowIdx = 0; rowIdx < height; rowIdx++) {
        for (var colIdx = 0; colIdx < width; colIdx++) {
            var currentGridCellType = gridValues[rowIdx][colIdx];

            if (rowIdx === 0 && currentGridCellType === CELL_TYPE_EMPTY) {
                dynamicProg[rowIdx][colIdx] = 1;
                continue;
            }

            if (rowIdx >= 1) {
                var pathFromTopLeft = getPathValueFromPrevious(dynamicProg, gridValues, rowIdx - 1, colIdx - 1, width);
                var pathFromTop = getPathValueFromPrevious(dynamicProg, gridValues, rowIdx - 1, colIdx, width);
                var pathFromTopRight = getPathValueFromPrevious(dynamicProg, gridValues, rowIdx - 1, colIdx + 1, width);

                var pathFromTwoUpSpecial = (rowIdx >= 2 && gridValues[rowIdx - 2][colIdx] === CELL_TYPE_SPECIAL_2)
                                         ? dynamicProg[rowIdx - 2][colIdx]
                                         : CELL_TYPE_EMPTY;

                if (currentGridCellType === CELL_TYPE_EMPTY) {
                    dynamicProg[rowIdx][colIdx] += pathFromTopLeft + pathFromTop + pathFromTopRight + pathFromTwoUpSpecial;
                } else if (currentGridCellType === CELL_TYPE_BLOCKED_1) {
                    dynamicProg[rowIdx][colIdx] = CELL_TYPE_EMPTY;
                } else if (currentGridCellType === CELL_TYPE_SPECIAL_2) {
                    dynamicProg[rowIdx][colIdx] += pathFromTop + pathFromTwoUpSpecial;
                }
            }
        }
    }

    var totalPaths = CELL_TYPE_EMPTY;
    for (var rowIdx = height - 2; rowIdx < height; rowIdx++) {
        for (var colIdx = 0; colIdx < width; colIdx++) {
            var currentGridCellType = gridValues[rowIdx][colIdx];
            if (shouldCellContributeToTotal(rowIdx, height, currentGridCellType)) {
                totalPaths += dynamicProg[rowIdx][colIdx];
            }
        }
    }
    console.log(totalPaths);
}
