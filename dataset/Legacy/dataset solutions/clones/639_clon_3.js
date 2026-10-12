var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineArray = rawData.trim().split("\n");

var dimensions = lineArray.shift().split(" ").map(Number);
var numRows = dimensions[0];
var numCols = dimensions[1];

var dataRows = [];
for (var rowIter = 0; rowIter < numRows; rowIter++) {
    dataRows.push(Number(lineArray.shift()));
}

var costCols = [];
for (var colIter = 0; colIter < numCols; colIter++) {
    costCols.push(Number(lineArray.shift()));
}

function createInitializedMatrix(maxColIndex, maxRowIndex, initialValue) {
    const matrix = [];
    for (let c = 0; c <= maxColIndex; c++) {
        matrix[c] = [];
        for (let r = 0; r <= maxRowIndex; r++) {
            matrix[c][r] = initialValue;
        }
    }
    return matrix;
}

var minCostMatrix = createInitializedMatrix(numCols, numRows, Infinity);

minCostMatrix[0][0] = 0;

for (var currentColIndex = 0; currentColIndex < numCols; currentColIndex++) {
    var currentCostValue = costCols[currentColIndex];

    for (var currentRowIndex = 0; currentRowIndex < numRows; currentRowIndex++) {
        var currentDataValue = dataRows[currentRowIndex];

        minCostMatrix[currentColIndex + k][currentRowIndex] = Math.min(minCostMatrix[currentColIndex + k][currentRowIndex], minCostMatrix[currentColIndex][currentRowIndex]);

        for (var stepOffset = 1; currentColIndex + stepOffset + numRows - currentRowIndex + 1 <= numCols; stepOffset++) {
            var calculatedProduct = currentCostValue * currentDataValue;
            var targetMatrixCol = currentColIndex + stepOffset;
            var targetMatrixRow = currentRowIndex + 1;
            var previousPathCost = minCostMatrix[currentColIndex][currentRowIndex];

            if (targetMatrixCol <= numCols && targetMatrixRow <= numRows) {
                minCostMatrix[targetMatrixCol][targetMatrixRow] = Math.min(minCostMatrix[targetMatrixCol][targetMatrixRow], previousPathCost + calculatedProduct);
            }
        }
    }
}

console.log(minCostMatrix[numCols][numRows]);
