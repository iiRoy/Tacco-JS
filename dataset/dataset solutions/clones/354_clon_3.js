const fileSystemModule = require('fs');
const EMPTY_CELL_INDICATOR = '.';
const TERMINATION_HEIGHT = 0;
const TERMINATION_WIDTH = 0;

const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
let inputLineBuffer = rawInputData.trim().split("\n");

function parseDimensionString(dimensionLine) {
    return dimensionLine.split(" ").map(Number);
}

while (true) {
    const currentDimensionLine = inputLineBuffer.shift();
    const [currentHeight, currentWidth] = parseDimensionString(currentDimensionLine);

    if (currentHeight === TERMINATION_HEIGHT && currentWidth === TERMINATION_WIDTH) {
        break;
    }

    const heightMap = [];

    for (let rowIndex = 0; rowIndex < currentHeight; rowIndex++) {
        const rowCharacterArray = inputLineBuffer.shift().split("");
        heightMap[rowIndex] = [];

        for (let colIndex = 0; colIndex < currentWidth; colIndex++) {
            const charAtCell = rowCharacterArray[colIndex];
            let cellHeight;

            if (charAtCell === EMPTY_CELL_INDICATOR) {
                if (rowIndex === 0) {
                    cellHeight = 1;
                } else {
                    cellHeight = heightMap[rowIndex - 1][colIndex] + 1;
                }
            } else {
                cellHeight = 0;
            }
            heightMap[rowIndex][colIndex] = cellHeight;
        }
    }

    let maximumRectangleArea = 0;

    for (let processingRowIndex = 0; processingRowIndex < currentHeight; processingRowIndex++) {
        const heightStackForCurrentRow = [];
        const currentRowHeights = heightMap[processingRowIndex];
        
        const effectiveRowHeights = [...currentRowHeights, 0];

        for (let currentColumnIndex = 0; currentColumnIndex <= currentWidth; currentColumnIndex++) {
            const currentBarHeight = effectiveRowHeights[currentColumnIndex];

            let lastPoppedBarIndex = currentColumnIndex;

            while (heightStackForCurrentRow.length > 0 && heightStackForCurrentRow[heightStackForCurrentRow.length - 1][0] >= currentBarHeight) {
                const poppedBarInfo = heightStackForCurrentRow.pop();
                const poppedBarHeight = poppedBarInfo[0];
                const poppedBarIndex = poppedBarInfo[1];

                maximumRectangleArea = Math.max(maximumRectangleArea, poppedBarHeight * (currentColumnIndex - poppedBarIndex));
                lastPoppedBarIndex = poppedBarIndex;
            }
            
            if (heightStackForCurrentRow.length === 0 || heightStackForCurrentRow[heightStackForCurrentRow.length - 1][0] < currentBarHeight) {
                heightStackForCurrentRow.push([currentBarHeight, lastPoppedBarIndex]);
            }
        }
    }
    console.log(maximumRectangleArea);
}
