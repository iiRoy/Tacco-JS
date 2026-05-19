var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var allInputLines = fileContent.trim().split("\n");

function* inputProcessor(linesSource) {
    let currentLineIndex = 0;
    while (true) {
        const dimensionsString = linesSource[currentLineIndex++].split(" ");
        const currentHeight = Number(dimensionsString[0]);
        const currentWidth = Number(dimensionsString[1]);

        if (currentHeight === 0 && currentWidth === 0) {
            return;
        }

        const characterRows = [];
        for (let i = 0; i < currentHeight; i++) {
            characterRows.push(linesSource[currentLineIndex++].split(""));
        }
        yield { matrixHeight: currentHeight, matrixWidth: currentWidth, charMatrix: characterRows };
    }
}

function buildConsecutiveHeights(charGrid, rowsCount, colsCount) {
    const heightDataMatrix = [];
    for (let r = 0; r < rowsCount; r++) {
        heightDataMatrix[r] = charGrid[r].map((cellChar, c) => {
            if (cellChar === '.') {
                return (r === 0) ? 1 : heightDataMatrix[r - 1][c] + 1;
            } else {
                return 0;
            }
        });
    }
    return heightDataMatrix;
}

function computeMaxHistogramRectangle(histogramBars) {
    const numBars = histogramBars.length;
    if (numBars === 0) return 0;

    const leftSmallerIndex = Array(numBars).fill(0);
    const rightSmallerIndex = Array(numBars).fill(numBars - 1);
    const indexStack = [];

    for (let i = 0; i < numBars; i++) {
        while (indexStack.length > 0 && histogramBars[indexStack[indexStack.length - 1]] >= histogramBars[i]) {
            indexStack.pop();
        }
        leftSmallerIndex[i] = (indexStack.length === 0) ? -1 : indexStack[indexStack.length - 1];
        indexStack.push(i);
    }

    indexStack.length = 0; // Clear the stack

    for (let i = numBars - 1; i >= 0; i--) {
        while (indexStack.length > 0 && histogramBars[indexStack[indexStack.length - 1]] >= histogramBars[i]) {
            indexStack.pop();
        }
        rightSmallerIndex[i] = (indexStack.length === 0) ? numBars : indexStack[indexStack.length - 1];
        indexStack.push(i);
    }

    let maximumArea = 0;
    for (let i = 0; i < numBars; i++) {
        const currentWidth = rightSmallerIndex[i] - leftSmallerIndex[i] - 1;
        maximumArea = Math.max(maximumArea, histogramBars[i] * currentWidth);
    }
    return maximumArea;
}

const gridDataIterator = inputProcessor(allInputLines);

for (const currentGridInfo of gridDataIterator) {
    const currentMatrixHeight = currentGridInfo.matrixHeight;
    const currentMatrixWidth = currentGridInfo.matrixWidth;
    const charGridContent = currentGridInfo.charMatrix;

    const dotHeightMatrix = buildConsecutiveHeights(charGridContent, currentMatrixHeight, currentMatrixWidth);

    let gridOverallMaxArea = 0;
    for (let r = 0; r < currentMatrixHeight; r++) {
        gridOverallMaxArea = Math.max(gridOverallMaxArea, computeMaxHistogramRectangle(dotHeightMatrix[r]));
    }
    console.log(gridOverallMaxArea);
}
