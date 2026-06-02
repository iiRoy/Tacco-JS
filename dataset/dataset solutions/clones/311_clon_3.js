var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

var initialN = parseInt(inputLines.shift(), 10);
var gridData = [];

var paddingRow = Array(initialN + 1).fill(0);
gridData.push(paddingRow);

for (let r = 0; r < initialN; r++) {
    const currentLine = "0 " + inputLines.shift();
    const rowNumbers = currentLine.split(" ").map(Number);
    gridData.push(rowNumbers);
}

const finalGridSize = initialN + 1;

var cumulativeSumGrid = Array.from({ length: finalGridSize }, () => Array(finalGridSize).fill(0));

for (let r = 0; r < finalGridSize; r++) {
    cumulativeSumGrid[r][0] = gridData[r][0];
}

for (let r = 0; r < finalGridSize; r++) {
    for (let c = 1; c < finalGridSize; c++) {
        cumulativeSumGrid[r][c] = cumulativeSumGrid[r][c - 1] + gridData[r][c];
    }
}

for (let r = 1; r < finalGridSize; r++) {
    for (let c = 0; c < finalGridSize; c++) {
        cumulativeSumGrid[r][c] += cumulativeSumGrid[r - 1][c];
    }
}

var overallMaxSum = -Infinity;

for (let r1 = 0; r1 < finalGridSize; r1++) {
    for (let c1 = 0; c1 < finalGridSize; c1++) {
        for (let r2 = r1; r2 < finalGridSize; r2++) {
            for (let c2 = c1; c2 < finalGridSize; c2++) {
                let currentRectangleSum = cumulativeSumGrid[r2][c2];
                let topExclusion = cumulativeSumGrid[r1][c2];
                let leftExclusion = cumulativeSumGrid[r2][c1];
                let overlapInclusion = cumulativeSumGrid[r1][c1];
                
                let calculatedSubRectSum = currentRectangleSum - topExclusion - leftExclusion + overlapInclusion;
                overallMaxSum = Math.max(overallMaxSum, calculatedSubRectSum);
            }
        }
    }
}

console.log(overallMaxSum);
