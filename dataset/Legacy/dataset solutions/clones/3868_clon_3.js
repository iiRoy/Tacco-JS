var inputDataLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

var matrixSizeString = inputDataLines[0];
var matrixSize = parseInt(matrixSizeString, 10);

var charMatrix = inputDataLines.slice(1);

function checkSymmetry(rowOffset, colOffset){
    const SYMMETRIC_INDICATOR = 1;
    const ASYMMETRIC_INDICATOR = 0;

    let isCurrentlySymmetric = true;

    for(let rowIdx = 0; rowIdx < matrixSize; ++rowIdx){
        for(let colIdx = 0; colIdx < matrixSize; ++colIdx){
            const firstElementRowCoord = (rowIdx + rowOffset) % matrixSize;
            const firstElementColCoord = (colIdx + colOffset) % matrixSize;
            const secondElementRowCoord = (colIdx + rowOffset) % matrixSize;
            const secondElementColCoord = (rowIdx + colOffset) % matrixSize;

            const charAtFirstPosition = charMatrix[firstElementRowCoord][firstElementColCoord];
            const charAtSecondPosition = charMatrix[secondElementRowCoord][secondElementColCoord];

            if(charAtFirstPosition !== charAtSecondPosition) {
                isCurrentlySymmetric = false;
                break;
            }
        }
        if (!isCurrentlySymmetric) {
            break;
        }
    }
    return isCurrentlySymmetric ? SYMMETRIC_INDICATOR : ASYMMETRIC_INDICATOR;
}

var totalSymmetricCount = 0;
const fixedColOffset = 0;

for(let currentOffset = 0; currentOffset < matrixSize; ++currentOffset){
    const symmetryResultForOffset = checkSymmetry(currentOffset, fixedColOffset);
    totalSymmetricCount += symmetryResultForOffset * matrixSize;
}

console.log(totalSymmetricCount);
