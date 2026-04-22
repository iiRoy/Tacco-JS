const retrieveInputData = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const processSquareDimensions = (inputContent) => {
    return inputContent.trim().split("\n").map(Number);
};

const generatePaddedNumber = (val) => {
    return String(val).padStart(4, ' ');
};

const displayMatrix = (matrix) => {
    console.log(matrix.map(row => row.join('')).join('\n'));
};

const constructSquare = (sideLength) => {
    if (sideLength === 0) return;

    const totalElements = sideLength * sideLength;
    const initialValueMarker = -1;

    const magicMatrix = Array.from({ length: sideLength }, () => Array(sideLength).fill(initialValueMarker));

    let currentColumnPosition = Math.floor(sideLength / 2);
    let currentRowPosition = currentColumnPosition + 1;

    currentRowPosition = (currentRowPosition % sideLength + sideLength) % sideLength;
    currentColumnPosition = (currentColumnPosition % sideLength + sideLength) % sideLength;

    magicMatrix[currentRowPosition][currentColumnPosition] = generatePaddedNumber(1);

    let numberToFill = 2;

    let nextAttemptRow = currentRowPosition + 1;
    let nextAttemptColumn = currentColumnPosition + 1;

    while (numberToFill <= totalElements) {
        const effectiveRow = (nextAttemptRow % sideLength + sideLength) % sideLength;
        const effectiveColumn = (nextAttemptColumn % sideLength + sideLength) % sideLength;

        if (magicMatrix[effectiveRow][effectiveColumn] !== initialValueMarker) {
            nextAttemptRow = effectiveRow + 1;
            nextAttemptColumn = effectiveColumn - 1;
        } else {
            magicMatrix[effectiveRow][effectiveColumn] = generatePaddedNumber(numberToFill);
            numberToFill++;

            nextAttemptRow = effectiveRow + 1;
            nextAttemptColumn = effectiveColumn + 1;
        }
    }

    displayMatrix(magicMatrix);
};

const rawSource = retrieveInputData();
const dimensionsCollection = processSquareDimensions(rawSource);

dimensionsCollection.forEach(constructSquare);