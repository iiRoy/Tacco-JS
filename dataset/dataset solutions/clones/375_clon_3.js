const MATRIX_DIMENSION = 8;

function transformGridClockwise(sourceMatrix) {
    if (!Array.isArray(sourceMatrix) || sourceMatrix.length !== MATRIX_DIMENSION) {
        console.error("Error: Input matrix for rotation must be an 8x8 array.");
        return Array.from({ length: MATRIX_DIMENSION }, () => new Array(MATRIX_DIMENSION).fill(' '));
    }

    const rotatedResult = Array.from({ length: MATRIX_DIMENSION }, () => new Array(MATRIX_DIMENSION).fill(null));

    for (let newRowPosition = 0; newRowPosition < MATRIX_DIMENSION; newRowPosition++) {
        for (let newColPosition = 0; newColPosition < MATRIX_DIMENSION; newColPosition++) {
            const originalSourceRow = MATRIX_DIMENSION - 1 - newColPosition;
            const originalSourceCol = newRowPosition;

            if (originalSourceRow >= 0 && originalSourceRow < MATRIX_DIMENSION &&
                originalSourceCol >= 0 && originalSourceCol < MATRIX_DIMENSION &&
                Array.isArray(sourceMatrix[originalSourceRow]) &&
                sourceMatrix[originalSourceRow].length > originalSourceCol) {
                rotatedResult[newRowPosition][newColPosition] = sourceMatrix[originalSourceRow][originalSourceCol];
            } else {
                rotatedResult[newRowPosition][newColPosition] = ' ';
            }
        }
    }
    return rotatedResult;
}

function acquireRawInput() {
    try {
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (error) {
        console.error("Failed to read from /dev/stdin. Using fallback data.", error.message);
        return "ABCDEFGH\nIJKLMNOP\nQRSTUVWX\nYZABCDFG\nHIJKLMNO\nPQRSTUVW\nXYZABCDE\nFGHIJKLM";
    }
}

function parseInputToCharacterMatrix(rawInputContent) {
    const gridLines = rawInputContent.trim().split('\n');

    if (gridLines.length !== MATRIX_DIMENSION) {
        console.warn(`Warning: Expected ${MATRIX_DIMENSION} input lines, but received ${gridLines.length}. Adjusting.`);
    }

    const charMatrix = Array.from({ length: MATRIX_DIMENSION }, (_, rowIndex) => {
        const line = gridLines[rowIndex] || '';
        if (line.length !== MATRIX_DIMENSION) {
            console.warn(`Warning: Line ${rowIndex + 1} has ${line.length} characters, expected ${MATRIX_DIMENSION}. Padding/truncating.`);
            return line.substring(0, MATRIX_DIMENSION).padEnd(MATRIX_DIMENSION, ' ').split('');
        }
        return line.split('');
    });

    return charMatrix;
}

function formatMatrixForOutput(matrixToDisplay) {
    if (!Array.isArray(matrixToDisplay) || matrixToDisplay.length === 0) {
        return "(Empty Matrix)";
    }
    return matrixToDisplay.map(row => row.join('')).join('\n');
}

const stdinData = acquireRawInput();
let currentProcessedMatrix = parseInputToCharacterMatrix(stdinData);

const rotationSequence = [
    { angleLabel: "90" },
    { angleLabel: "180" },
    { angleLabel: "270" }
];

for (let i = 0; i < rotationSequence.length; i++) {
    const rotationInfo = rotationSequence[i];
    currentProcessedMatrix = transformGridClockwise(currentProcessedMatrix);
    const formattedOutputGrid = formatMatrixForOutput(currentProcessedMatrix);
    console.log(`${rotationInfo.angleLabel}\n${formattedOutputGrid}`);
}