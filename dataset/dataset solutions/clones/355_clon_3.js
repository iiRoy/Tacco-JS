const TERMINATION_SEQUENCE = "0 0";

function extractDimensions(dimensionString) {
    return dimensionString.split(" ").map(Number);
}

function calculateCurrentRowHeights(previousRowHeights, currentRowCharacters) {
    const rowLength = currentRowCharacters.length;
    const newRowHeights = new Array(rowLength);

    for (let currentColumn = 0; currentColumn < rowLength; currentColumn++) {
        const charAtCell = currentRowCharacters[currentColumn];
        if (charAtCell === ".") {
            newRowHeights[currentColumn] = (previousRowHeights ? previousRowHeights[currentColumn] : 0) + 1;
        } else { // charAtCell === "*"
            newRowHeights[currentColumn] = 0;
        }
    }
    return newRowHeights;
}

function findMaxRectangleInHistogram(histogramHeights) {
    let localMaxArea = 0;
    const stackOfHeights = []; // Stores [height, index] pairs

    // Add a sentinel value (0) at the end to ensure all elements in the stack are processed
    const extendedHeights = [...histogramHeights, 0];
    const numCols = extendedHeights.length;

    for (let currentColumn = 0; currentColumn < numCols; currentColumn++) {
        const currentHeightValue = extendedHeights[currentColumn];
        let lastPoppedIndex; // Replicates original's `var last;` for each `x` iteration. Will be `undefined` initially.

        // Original's `if(s.length==0)` or `s[s.length-1][0]<v`
        if (stackOfHeights.length === 0 || stackOfHeights[stackOfHeights.length - 1][0] < currentHeightValue) {
            stackOfHeights.push([currentHeightValue, currentColumn]);
            continue;
        }
        // Original's `else if(s[s.length-1][0]==v)continue;`
        if (stackOfHeights[stackOfHeights.length - 1][0] === currentHeightValue) {
            continue;
        }

        // Original's `else if(s[s.length-1][0]>v)` block
        while (true) {
            // Original: `if(s.length==0){s.push([v,last]);break;}`
            // `lastPoppedIndex` will be `undefined` here if no elements were popped yet in this `currentColumn` iteration.
            // This replicates the original code's behavior for the `last` variable.
            if (stackOfHeights.length === 0) {
                stackOfHeights.push([currentHeightValue, lastPoppedIndex]);
                break;
            }

            const poppedStackElement = stackOfHeights.pop();
            const poppedHeight = poppedStackElement[0];
            const poppedElementOriginalIndex = poppedStackElement[1];

            // Original: `if(v>r[0]){s.push([v,last]);break;}`
            if (currentHeightValue > poppedHeight) {
                stackOfHeights.push([currentHeightValue, lastPoppedIndex]);
                break;
            }

            // Original: `last=r[1];`
            lastPoppedIndex = poppedElementOriginalIndex;

            // Original: `if(v==r[0])break;`
            if (currentHeightValue === poppedHeight) {
                break;
            }
            // Original: `else if(v<=r[0]){ max=Math.max(max,r[0]*(x-r[1])); }`
            // This implies `currentHeightValue < poppedHeight` because `v==r[0]` was handled.
            localMaxArea = Math.max(localMaxArea, poppedHeight * (currentColumn - poppedElementOriginalIndex));
        }
    }
    return localMaxArea;
}

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
rawInputData = '2 4\n...*\n.*..\n0 0'; // Mocking input as per original

var processedLines = rawInputData.trim().split("\n");

while (true) {
    const currentDimensions = extractDimensions(processedLines.shift());
    const gridHeight = currentDimensions[0];
    const gridWidth = currentDimensions[1];

    if (gridHeight === 0 && gridWidth === 0) {
        break;
    }

    const heightGrid = []; // Stores the calculated heights for each cell

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        const rowCharacters = processedLines.shift().split("");
        const previousHeights = (rowIndex > 0) ? heightGrid[rowIndex - 1] : null;
        heightGrid[rowIndex] = calculateCurrentRowHeights(previousHeights, rowCharacters);
    }

    let overallMaxArea = 0; // Reset max area for each test case

    for (let histogramRowIndex = 0; histogramRowIndex < gridHeight; histogramRowIndex++) {
        const currentHistogramRow = heightGrid[histogramRowIndex];
        const rowMaxArea = findMaxRectangleInHistogram(currentHistogramRow);
        overallMaxArea = Math.max(overallMaxArea, rowMaxArea);
    }
    console.log(overallMaxArea);
}
