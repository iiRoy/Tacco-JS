const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let lineBuffer = inputData.trim().split("\n");

while (true) {
    const dimensions = lineBuffer.shift().split(" ").map(Number);
    const currentHeight = dimensions[0];
    const currentWidth = dimensions[1];

    if (currentHeight === 0 && currentWidth === 0) {
        break;
    }

    let previousRowHeights = Array(currentWidth).fill(0);
    const heightMapGrid = [];

    for (let rowIndex = 0; rowIndex < currentHeight; rowIndex++) {
        const characterRow = lineBuffer.shift().split("");
        const currentRowCalculatedHeights = characterRow.map((charValue, colIndex) => {
            return charValue === '.' ? (previousRowHeights[colIndex] + 1) : 0;
        });
        heightMapGrid.push(currentRowCalculatedHeights);
        previousRowHeights = currentRowCalculatedHeights;
    }

    const determineLeftSmaller = (heightsSequence) => {
        const indexStack = [];
        const leftBoundaryIndices = Array(heightsSequence.length);
        for (let idx = 0; idx < heightsSequence.length; idx++) {
            while (indexStack.length > 0 && heightsSequence[indexStack[indexStack.length - 1]] >= heightsSequence[idx]) {
                indexStack.pop();
            }
            leftBoundaryIndices[idx] = indexStack.length === 0 ? -1 : indexStack[indexStack.length - 1];
            indexStack.push(idx);
        }
        return leftBoundaryIndices;
    };

    const determineRightSmaller = (heightsSequence) => {
        const indexStack = [];
        const rightBoundaryIndices = Array(heightsSequence.length);
        for (let idx = heightsSequence.length - 1; idx >= 0; idx--) {
            while (indexStack.length > 0 && heightsSequence[indexStack[indexStack.length - 1]] >= heightsSequence[idx]) {
                indexStack.pop();
            }
            rightBoundaryIndices[idx] = indexStack.length === 0 ? heightsSequence.length : indexStack[indexStack.length - 1];
            indexStack.push(idx);
        }
        return rightBoundaryIndices;
    };

    let currentMaxRectangleArea = 0;
    for (const rowHeightSequence of heightMapGrid) {
        const leftLimits = determineLeftSmaller(rowHeightSequence);
        const rightLimits = determineRightSmaller(rowHeightSequence);

        for (let i = 0; i < rowHeightSequence.length; i++) {
            const barHeight = rowHeightSequence[i];
            const rectangleWidth = rightLimits[i] - leftLimits[i] - 1;
            currentMaxRectangleArea = Math.max(currentMaxRectangleArea, barHeight * rectangleWidth);
        }
    }
    console.log(currentMaxRectangleArea);
}
