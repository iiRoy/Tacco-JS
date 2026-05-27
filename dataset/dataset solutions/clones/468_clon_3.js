function matrixRotate(inputMatrix) {
    const matrixSize = inputMatrix.length - 1;
    const rotatedMatrix = inputMatrix.map(row => row.slice());

    for (let rowIdx = 0; rowIdx <= matrixSize; rowIdx++) {
        for (let colIdx = 0; colIdx <= matrixSize; colIdx++) {
            const sourceRow = matrixSize - colIdx;
            const sourceCol = rowIdx;
            rotatedMatrix[rowIdx][colIdx] = inputMatrix[sourceRow][sourceCol];
        }
    }
    return rotatedMatrix;
}

function verifyPattern(rowOffset, colOffset, patternSize, patternMatrix, targetMatrix) {
    let firstMatchCoords = false;

    for (let patRow = 0; patRow < patternSize; patRow++) {
        for (let patCol = 0; patCol < patternSize; patCol++) {
            const patternValue = patternMatrix[patRow][patCol];

            if (patternValue === -1) {
                continue;
            }

            const targetRow = rowOffset + patRow;
            const targetCol = colOffset + patCol;

            if (firstMatchCoords === false) {
                firstMatchCoords = [targetRow, targetCol];
            }

            if (targetMatrix[targetRow][targetCol] !== patternValue) {
                return false;
            }
        }
    }
    return firstMatchCoords;
}

function parseDimensionsLine(line) {
    const parts = line.split(" ").map(Number);
    return { targetRows: parts[0], patternRows: parts[1] };
}

function readMatrixData(numRows, sourceLines) {
    const matrix = [];
    for (let i = 0; i < numRows; i++) {
        const rowValues = sourceLines.shift().split(" ").map(Number);
        matrix.push(rowValues);
    }
    return matrix;
}

function updateMinCoordinates(currentMin, candidateRow, candidateCol) {
    if (currentMin[0] > candidateRow) {
        return [candidateRow, candidateCol];
    } else if (currentMin[0] === candidateRow && currentMin[1] > candidateCol) {
        return [candidateRow, candidateCol];
    }
    return currentMin;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputData.trim().split("\n");

while (true) {
    const { targetRows, patternRows } = parseDimensionsLine(inputLinesArray.shift());

    if (targetRows === 0 && patternRows === 0) {
        break;
    }

    const targetMatrix = readMatrixData(targetRows, inputLinesArray);
    let patternMatrix = readMatrixData(patternRows, inputLinesArray);

    let minMatchCoords = [101, 101];

    for (let rotationCount = 0; rotationCount < 4; rotationCount++) {
        for (let targetRowOffset = 0; targetRowOffset <= targetRows - patternRows; targetRowOffset++) {
            for (let targetColOffset = 0; targetColOffset <= targetRows - patternRows; targetColOffset++) {
                const currentMatchResult = verifyPattern(
                    targetRowOffset,
                    targetColOffset,
                    patternRows,
                    patternMatrix,
                    targetMatrix
                );

                if (currentMatchResult !== false) {
                    const candidateRowForOutput = currentMatchResult[0] + 1;
                    const candidateColForOutput = currentMatchResult[1] + 1;

                    minMatchCoords = updateMinCoordinates(
                        minMatchCoords,
                        candidateRowForOutput,
                        candidateColForOutput
                    );
                }
            }
        }
        patternMatrix = matrixRotate(patternMatrix);
    }

    const noMatchFound = (minMatchCoords[0] === 101 && minMatchCoords[1] === 101);
    if (noMatchFound) {
        console.log("NA");
    } else {
        console.log(`${minMatchCoords[1]} ${minMatchCoords[0]}`);
    }
}
