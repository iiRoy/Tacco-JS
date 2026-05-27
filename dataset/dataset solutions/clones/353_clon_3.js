const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.trim().split("\n");

// Helper function to check the termination condition
const isTerminationCondition = (dimensionsArray) => {
    return dimensionsArray[0] === 0 && dimensionsArray[1] === 0;
};

while (true) {
    let dimensions = inputLines.shift().split(" ").map(Number);

    if (isTerminationCondition(dimensions)) {
        break;
    }

    const gridHeight = dimensions[0];
    const gridWidth = dimensions[1];

    const heightGrid = []; // Renamed from 'yx'

    // Helper function to calculate the height for a single cell
    const determineCellHeight = (currentRowIndex, currentColumnIndex, characterValue, previousHeightGrid) => {
        const isObstacle = (characterValue !== '.');
        if (isObstacle) {
            return 0;
        } else {
            if (currentRowIndex === 0) {
                return 1;
            } else {
                return previousHeightGrid[currentRowIndex - 1][currentColumnIndex] + 1;
            }
        }
    };

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) { // Renamed from 'y'
        const rowCharacters = inputLines.shift().split(""); // Renamed from 'ary'
        heightGrid[rowIndex] = [];
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) { // Renamed from 'x', changed from forEach
            const cellChar = rowCharacters[colIndex]; // Renamed from 'v'
            heightGrid[rowIndex][colIndex] = determineCellHeight(rowIndex, colIndex, cellChar, heightGrid);
        }
    }

    let maximumArea = 0; // Renamed from 'max'

    // Logic for Largest Rectangle in Histogram (LRH) for each row
    for (let currentGridRow = 0; currentGridRow < gridHeight; currentGridRow++) { // Renamed from 'k'
        const heightStack = []; // Renamed from 's'
        const currentRowHeights = heightGrid[currentGridRow];
        currentRowHeights[gridWidth] = 0; // Add a sentinel value at the end of the row

        for (let colIndex = 0; colIndex <= gridWidth; colIndex++) { // Renamed from 'x'
            const currentBarHeight = currentRowHeights[colIndex]; // Renamed from 'v'

            // Original conditional flow for stack operations
            if (heightStack.length === 0) {
                heightStack.push([currentBarHeight, colIndex + 1]); // Preserving original 'x+1' for first push
                continue;
            }

            const topOfStack = heightStack[heightStack.length - 1];
            const topHeight = topOfStack[0];

            if (topHeight < currentBarHeight) {
                heightStack.push([currentBarHeight, colIndex]); // Preserving original 'x' for taller push
            } else if (topHeight === currentBarHeight) {
                // Original: continue;
                // No explicit action needed, effectively extending the previous bar
            } else { // topHeight > currentBarHeight
                // Pop bars from stack that are taller than the current bar
                while (heightStack.length > 0) {
                    const poppedBar = heightStack.pop(); // Renamed from 'r'
                    const poppedHeight = poppedBar[0];
                    const poppedStartIndex = poppedBar[1];

                    // Original logic for handling popped bars
                    if (currentBarHeight > poppedHeight) {
                        heightStack.push(poppedBar); // Re-push if current bar is taller than the popped one
                        break;
                    } else if (currentBarHeight === poppedHeight) {
                        break; // Stop if current bar is of the same height as the popped one
                    } else { // currentBarHeight < poppedHeight
                        const calculatedWidth = (colIndex + 1) - poppedStartIndex;
                        maximumArea = Math.max(maximumArea, poppedHeight * calculatedWidth);
                    }
                }
                // Important: The original code does NOT push 'currentBarHeight' here after the while loop.
                // It only pushes if 'heightStack.length === 0' or 'topHeight < currentBarHeight'
                // (handled by the initial 'if' and 'else if' blocks).
            }
        }
    }
    console.log(maximumArea);
}
