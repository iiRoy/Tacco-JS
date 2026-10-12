function* problemIterator(sourceLines) {
    let lineCursor = 0;
    while (lineCursor < sourceLines.length) {
        const currentDimension = parseInt(sourceLines[lineCursor++], 10);
        if (currentDimension === 0) {
            break;
        }

        const initialMatrix = Array.from({ length: currentDimension }, () =>
            sourceLines[lineCursor++].split("")
        );
        yield { dimension: currentDimension, initialMatrix: initialMatrix };
    }
}

function determineSquareExtent(rowPosition, colPosition, currentGrid, gridDimension) {
    if (currentGrid[rowPosition][colPosition] === "*") {
        return 0;
    }

    if (rowPosition === 0 || colPosition === 0) {
        return 1;
    }

    const valueAboveLeft = currentGrid[rowPosition - 1][colPosition - 1];
    const valueAbove = currentGrid[rowPosition - 1][colPosition];
    const valueLeft = currentGrid[rowPosition][colPosition - 1];

    return 1 + Math.min(valueAboveLeft, valueAbove, valueLeft);
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");

for (const problemInstance of problemIterator(inputLines)) {
    const currentDimension = problemInstance.dimension;
    const currentMatrix = problemInstance.initialMatrix;

    let maximumSquareSize = 0;

    Array.from({ length: currentDimension }, (_, r) => r).forEach(rowIndex => {
        Array.from({ length: currentDimension }, (_, c) => c).forEach(colIndex => {
            const calculatedValue = determineSquareExtent(rowIndex, colIndex, currentMatrix, currentDimension);
            currentMatrix[rowIndex][colIndex] = calculatedValue;
            if (calculatedValue > maximumSquareSize) {
                maximumSquareSize = calculatedValue;
            }
        });
    });

    console.log(maximumSquareSize);
}
