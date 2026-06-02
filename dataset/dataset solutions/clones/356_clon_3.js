const readAndParseInputData = (sourcePath) => {
    const rawFileContent = require('fs').readFileSync(sourcePath, 'utf8');
    return rawFileContent.trim().split("\n");
};

const extractNextDimensions = (dataLines) => {
    const dimensionLine = dataLines.shift();
    const dimensionValues = dimensionLine.split(" ").map(Number);
    const currentHeight = dimensionValues[0];
    const currentWidth = dimensionValues[1];
    const isTerminationCondition = (currentHeight === 0 && currentWidth === 0);
    return {
        height: currentHeight,
        width: currentWidth,
        isTermination: isTerminationCondition
    };
};

const computeCellHeight = (isFirstGridRow, characterValue, heightFromPreviousRow) => {
    if (characterValue === ".") {
        return isFirstGridRow ? 1 : heightFromPreviousRow + 1;
    } else {
        return 0;
    }
};

let inputLines = readAndParseInputData('/dev/stdin');

while (true) {
    const currentProblemDimensions = extractNextDimensions(inputLines);

    if (currentProblemDimensions.isTermination) {
        break;
    }

    const gridHeight = currentProblemDimensions.height;
    const gridWidth = currentProblemDimensions.width;

    const heightMapGrid = [];
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        const rowCharacters = inputLines.shift().split("");
        heightMapGrid[rowIndex] = [];

        rowCharacters.forEach((charValue, colIndex) => {
            const isFirstRow = (rowIndex === 0);
            const previousRowCellHeight = isFirstRow ? 0 : heightMapGrid[rowIndex - 1][colIndex];
            heightMapGrid[rowIndex][colIndex] = computeCellHeight(isFirstRow, charValue, previousRowCellHeight);
        });
    }

    let currentCaseMaxArea = 0;

    for (let currentRowIndex = 0; currentRowIndex < gridHeight; currentRowIndex++) {
        const heightStack = [];
        const currentHistogramRow = heightMapGrid[currentRowIndex];
        currentHistogramRow[gridWidth] = 0;

        for (let colIndex = 0; colIndex <= gridWidth; colIndex++) {
            const currentBarHeight = currentHistogramRow[colIndex];
            const stackLength = heightStack.length;

            if (stackLength === 0) {
                heightStack.push([currentBarHeight, colIndex + 1]);
                continue;
            }

            const topOfStack = heightStack[stackLength - 1];
            const topStackHeight = topOfStack[0];

            if (topStackHeight < currentBarHeight) {
                heightStack.push([currentBarHeight, colIndex]);
            } else if (topStackHeight === currentBarHeight) {
                continue;
            } else {
                while (heightStack.length > 0) {
                    const poppedElement = heightStack.pop();
                    const poppedElementHeight = poppedElement[0];
                    const poppedElementStartIndex = poppedElement[1];

                    if (currentBarHeight > poppedElementHeight) {
                        heightStack.push(poppedElement);
                        break;
                    } else if (currentBarHeight === poppedElementHeight) {
                        break;
                    } else {
                        const rectangleWidth = (colIndex + 1) - poppedElementStartIndex;
                        const calculatedArea = poppedElementHeight * rectangleWidth;
                        currentCaseMaxArea = Math.max(currentCaseMaxArea, calculatedArea);
                    }
                }
            }
        }
    }
    console.log(currentCaseMaxArea);
}
