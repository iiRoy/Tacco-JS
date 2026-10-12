function rotateMatrix(inputMatrix) {
    const MATRIX_DIMENSION = 8;
    let rotatedMatrix = [];

    for (let rowInit = 0; rowInit < MATRIX_DIMENSION; rowInit++) {
        rotatedMatrix[rowInit] = new Array(MATRIX_DIMENSION);
    }

    for (let targetRow = 0; targetRow < MATRIX_DIMENSION; targetRow++) {
        for (let targetCol = 0; targetCol < MATRIX_DIMENSION; targetCol++) {
            const sourceRow = MATRIX_DIMENSION - 1 - targetCol;
            const sourceCol = targetRow;
            rotatedMatrix[targetRow][targetCol] = inputMatrix[sourceRow][sourceCol];
        }
    }
    return rotatedMatrix;
}

function parseInputMatrix(dimension) {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const lineArray = fileContent.trim().split("\n");

    let initialMatrix = [];
    for (let lineIndex = 0; lineIndex < dimension; lineIndex++) {
        initialMatrix.push(lineArray[lineIndex].split(""));
    }
    return initialMatrix;
}

function displayRotatedMatrix(rotationAngle, matrixToDisplay) {
    const matrixString = matrixToDisplay.map(row => row.join("")).join("\n");
    console.log(rotationAngle + "\n" + matrixString);
}

const MATRIX_SIZE = 8;

let currentMatrix = parseInputMatrix(MATRIX_SIZE);

const rotationAngles = [90, 180, 270];

currentMatrix = rotateMatrix(currentMatrix);
displayRotatedMatrix(rotationAngles[0], currentMatrix);

for (let rotationIndex = 1; rotationIndex < rotationAngles.length; rotationIndex++) {
    currentMatrix = rotateMatrix(currentMatrix);
    displayRotatedMatrix(rotationAngles[rotationIndex], currentMatrix);
}
