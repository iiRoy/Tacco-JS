const rawSourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = rawSourceData.trim().split("\n");

function processGridBlock(inputSegments) {
    if (inputSegments.length === 0) return null;

    const dimensions = inputSegments.shift().split(" ").map(Number);
    const [rowsNum, colsNum] = dimensions;

    if (rowsNum === 0 && colsNum === 0) {
        return null;
    }

    const verticalHeights = Array(rowsNum).fill(0).map(() => Array(colsNum).fill(0));

    for (let rIdx = 0; rIdx < rowsNum; rIdx++) {
        const cellContents = inputSegments.shift().split("");
        for (let cIdx = 0; cIdx < colsNum; cIdx++) {
            const currentCell = cellContents[cIdx];
            verticalHeights[rIdx][cIdx] = (currentCell === '.') ?
                (rIdx > 0 ? verticalHeights[rIdx - 1][cIdx] + 1 : 1) :
                0;
        }
    }

    function determineLargestHistogramRectangle(barValues) {
        const totalBars = barValues.length;
        if (totalBars === 0) return 0;

        const leftLimits = Array(totalBars).fill(0);
        const rightLimits = Array(totalBars).fill(totalBars - 1);
        const positionStack = [];

        for (let i = 0; i < totalBars; i++) {
            while (positionStack.length > 0 && barValues[positionStack[positionStack.length - 1]] >= barValues[i]) {
                positionStack.pop();
            }
            leftLimits[i] = (positionStack.length === 0) ? 0 : positionStack[positionStack.length - 1] + 1;
            positionStack.push(i);
        }

        positionStack.length = 0; // Reset stack

        for (let i = totalBars - 1; i >= 0; i--) {
            while (positionStack.length > 0 && barValues[positionStack[positionStack.length - 1]] >= barValues[i]) {
                positionStack.pop();
            }
            rightLimits[i] = (positionStack.length === 0) ? (totalBars - 1) : positionStack[positionStack.length - 1] - 1;
            positionStack.push(i);
        }

        let ultimateArea = 0;
        for (let i = 0; i < totalBars; i++) {
            const calculatedSpan = barValues[i] * (rightLimits[i] - leftLimits[i] + 1);
            if (calculatedSpan > ultimateArea) {
                ultimateArea = calculatedSpan;
            }
        }
        return ultimateArea;
    }

    let overallMaximumArea = 0;
    for (let rowIdx = 0; rowIdx < rowsNum; rowIdx++) {
        const currentRowHistogram = verticalHeights[rowIdx];
        const rowLargestArea = determineLargestHistogramRectangle(currentRowHistogram);
        if (rowLargestArea > overallMaximumArea) {
            overallMaximumArea = rowLargestArea;
        }
    }

    return { computedResult: overallMaximumArea, remainingInput: inputSegments };
}

let currentInputLines = [...lineSegments];

while (true) {
    const processingOutcome = processGridBlock(currentInputLines);
    if (processingOutcome === null) {
        break;
    }
    console.log(processingOutcome.computedResult);
    currentInputLines = processingOutcome.remainingInput;
}