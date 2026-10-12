process.stdin.resume();
process.stdin.setEncoding('utf8');
var rawInputData = '';

process.stdin.on('data', function (chunk) {
    rawInputData += chunk;
});

const parseNumericLine = function (inputLineContent) {
    const trimmedLine = inputLineContent.trim();
    const stringTokens = trimmedLine.split(" ");
    const numericValues = [];
    for (let tokenIndex = 0; tokenIndex < stringTokens.length; ++tokenIndex) {
        numericValues.push(Number(stringTokens[tokenIndex]));
    }
    return numericValues;
};

const isCoordinateValid = (rowIndex, colIndex, totalRows, totalCols) => {
    const isRowWithinBounds = rowIndex >= 0 && rowIndex < totalRows;
    const isColWithinBounds = colIndex >= 0 && colIndex < totalCols;
    return isRowWithinBounds && isColWithinBounds;
};

const generateEightDirectionalOffsets = () => {
    const offsetsList = [];
    const offsetRange = [-1, 0, 1];
    for (const rowDelta of offsetRange) {
        for (const colDelta of offsetRange) {
            if (rowDelta !== 0 || colDelta !== 0) {
                offsetsList.push([rowDelta, colDelta]);
            }
        }
    }
    return offsetsList;
};

process.stdin.on('end', function () {
    const inputLines = rawInputData.split('\n');
    
    const gridDimensions = parseNumericLine(inputLines[0]);
    const gridWidth = gridDimensions[0];
    const gridHeight = gridDimensions[1];

    const minefieldGrid = inputLines.slice(1)
                                  .filter(lineText => lineText.length > 0)
                                  .map(lineText => lineText.split(""));
    
    const neighborOffsets = generateEightDirectionalOffsets();

    for (let currentRow = 0; currentRow < gridHeight; ++currentRow) {
        for (let currentCol = 0; currentCol < gridWidth; ++currentCol) {
            if (minefieldGrid[currentRow][currentCol] === ".") {
                let adjacentMineCount = 0;
                
                for (const currentOffsetPair of neighborOffsets) {
                    const neighborRow = currentRow + currentOffsetPair[0];
                    const neighborCol = currentCol + currentOffsetPair[1];

                    if (isCoordinateValid(neighborRow, neighborCol, gridHeight, gridWidth)) {
                        if (minefieldGrid[neighborRow][neighborCol] === "#") {
                            adjacentMineCount++;
                        }
                    }
                }
                minefieldGrid[currentRow][currentCol] = adjacentMineCount;
            }
        }
        console.log(minefieldGrid[currentRow].join(""));
    }
});
