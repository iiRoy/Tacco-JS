const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLineSegments = rawInputContent.trim().split("\n");

const transformMatrix = (sourceMatrix) => {
    const matrixDimension = sourceMatrix.length;
    return Array.from({ length: matrixDimension }, (_, rowIndex) =>
        Array.from({ length: matrixDimension }, (_, colIndex) => sourceMatrix[matrixDimension - 1 - colIndex][rowIndex])
    );
};

const verifyPatternMatch = (rowOffset, colOffset, mainGrid, patternMatrix, patternDimension) => {
    let firstNonWildcardLocation = null;

    const patternElements = Array.from({ length: patternDimension }, (_, r) =>
        Array.from({ length: patternDimension }, (_, c) => ({ r, c, value: patternMatrix[r][c] }))
    ).flat();

    const allElementsMatch = patternElements.every(element => {
        const { r, c, value } = element;

        if (value === -1) {
            return true;
        }

        const currentMainGridValue = mainGrid[rowOffset + r][colOffset + c];

        if (firstNonWildcardLocation === null) {
            firstNonWildcardLocation = [rowOffset + r, colOffset + c];
        }

        return currentMainGridValue === value;
    });

    return allElementsMatch ? firstNonWildcardLocation : false;
};

while (true) {
    const dimensions = inputLineSegments.shift().split(" ").map(Number);
    const mainGridSize = dimensions[0];
    const patternDimension = dimensions[1];

    if (mainGridSize === 0 && patternDimension === 0) {
        break;
    }

    const mainGridData = Array.from({ length: mainGridSize }, () =>
        inputLineSegments.shift().split(" ").map(Number)
    );

    let currentPatternData = Array.from({ length: patternDimension }, () =>
        inputLineSegments.shift().split(" ").map(Number)
    );

    let bestMatchCoordinates = [101, 101];

    Array.from({ length: 4 }).forEach(() => {
        const maxRowOffset = mainGridSize - patternDimension;
        const maxColOffset = mainGridSize - patternDimension;

        const possibleOffsets = Array.from({ length: Math.max(0, maxRowOffset + 1) }, (_, rOffset) =>
            Array.from({ length: Math.max(0, maxColOffset + 1) }, (_, cOffset) => ({ r: rOffset, c: cOffset }))
        ).flat();

        possibleOffsets.forEach(offset => {
            const matchResult = verifyPatternMatch(offset.r, offset.c, mainGridData, currentPatternData, patternDimension);

            if (matchResult !== false) {
                const [matchRowZeroIndexed, matchColZeroIndexed] = matchResult;
                const candidateRowOneIndexed = matchRowZeroIndexed + 1;
                const candidateColOneIndexed = matchColZeroIndexed + 1;

                if (bestMatchCoordinates[0] >= candidateRowOneIndexed && bestMatchCoordinates[1] > candidateColOneIndexed) {
                    bestMatchCoordinates = [candidateRowOneIndexed, candidateColOneIndexed];
                }
            }
        });

        currentPatternData = transformMatrix(currentPatternData);
    });

    const resultString = bestMatchCoordinates.join("");
    console.log((resultString === "101101") ? "NA" : `${bestMatchCoordinates[1]} ${bestMatchCoordinates[0]}`);
}
