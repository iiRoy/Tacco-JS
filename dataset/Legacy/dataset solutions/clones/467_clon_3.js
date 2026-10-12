function matrixRotate(inputMatrix) {
    const matrixDimension = inputMatrix.length;
    const lastIndex = matrixDimension - 1;
    const rotatedMatrix = inputMatrix.map(row => row.slice());

    for (let rowIdx = 0; rowIdx < matrixDimension; rowIdx++) {
        for (let colIdx = 0; colIdx < matrixDimension; colIdx++) {
            rotatedMatrix[rowIdx][colIdx] = inputMatrix[lastIndex - colIdx][rowIdx];
        }
    }
    return rotatedMatrix;
}

function verifyMatch(rowOffset, colOffset, currentMainGrid, currentModelPattern, currentModelSizeM) {
    let firstNonNegativeMatchCoord = null;
    const modelSize = currentModelSizeM;

    for (let modelRow = 0; modelRow < modelSize; modelRow++) {
        for (let modelCol = 0; modelCol < modelSize; modelCol++) {
            const patternValue = currentModelPattern[modelRow][modelCol];

            if (patternValue === -1) {
                continue;
            }

            if (firstNonNegativeMatchCoord === null) {
                firstNonNegativeMatchCoord = [rowOffset + modelRow, colOffset + modelCol];
            }

            const gridValue = currentMainGrid[rowOffset + modelRow][colOffset + modelCol];
            if (gridValue !== patternValue) {
                return false;
            }
        }
    }
    return firstNonNegativeMatchCoord;
}

function parseLineOfNumbers(lineSource) {
    return lineSource.shift().split(" ").map(Number);
}

function readSquareMatrix(size, lineSource) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
        matrix.push(parseLineOfNumbers(lineSource));
    }
    return matrix;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLinesArray = rawInputData.trim().split("\n");

while (true) {
    const currentDimensions = parseLineOfNumbers(inputLinesArray);
    const mainGridSizeN = currentDimensions[0];
    const modelPatternSizeM = currentDimensions[1];

    if (mainGridSizeN === 0 && modelPatternSizeM === 0) {
        break;
    }

    const mainGridData = readSquareMatrix(mainGridSizeN, inputLinesArray);
    let modelPatternData = readSquareMatrix(modelPatternSizeM, inputLinesArray);

    const initialMinRow = 101;
    const initialMinCol = 101;
    let minFoundPosition = [initialMinRow, initialMinCol];

    for (let rotationIteration = 0; rotationIteration < 4; rotationIteration++) {
        for (let gridRowOffset = 0; gridRowOffset <= mainGridSizeN - modelPatternSizeM; gridRowOffset++) {
            for (let gridColOffset = 0; gridColOffset <= mainGridSizeN - modelPatternSizeM; gridColOffset++) {
                const currentMatchResult = verifyMatch(
                    gridRowOffset,
                    gridColOffset,
                    mainGridData,
                    modelPatternData,
                    modelPatternSizeM
                );

                if (currentMatchResult !== false) {
                    const matchedRowOneIndexed = currentMatchResult[0] + 1;
                    const matchedColOneIndexed = currentMatchResult[1] + 1;

                    const currentMinRow = minFoundPosition[0];
                    const currentMinCol = minFoundPosition[1];

                    const isNewRowBetterOrEqual = matchedRowOneIndexed <= currentMinRow;
                    const isNewColStrictlyBetter = matchedColOneIndexed < currentMinCol;

                    if (isNewRowBetterOrEqual && isNewColStrictlyBetter) {
                        minFoundPosition = [matchedRowOneIndexed, matchedColOneIndexed];
                    }
                }
            }
        }
        modelPatternData = matrixRotate(modelPatternData);
    }

    const initialMinPositionString = initialMinRow.toString() + initialMinCol.toString();
    const finalMinPositionString = minFoundPosition[0].toString() + minFoundPosition[1].toString();

    if (finalMinPositionString === initialMinPositionString) {
        console.log("NA");
    } else {
        console.log(minFoundPosition[1] + " " + minFoundPosition[0]);
    }
}
