var input = require('fs').readFileSync('/dev/stdin', 'utf8');
input = '2 4\n...*\n.*..\n0 0';

let sourceLines = input.trim().split("\n");

const computeLargestRectangle = (histogramValues) => {
    let peakArea = 0;
    const indexStack = []; // Stores indices of bars in increasing order of height
    const count = histogramValues.length;

    // Iterate through all bars, including a virtual bar of height 0 at the end
    // to ensure all bars in the stack are processed.
    for (let currentPosition = 0; currentPosition <= count; currentPosition++) {
        const currentBarHeight = (currentPosition === count) ? 0 : histogramValues[currentPosition];

        // While the stack is not empty and the height of the bar at the top of the stack
        // is greater than or equal to the current bar's height, pop from stack.
        while (indexStack.length > 0 && histogramValues[indexStack[indexStack.length - 1]] >= currentBarHeight) {
            const topIndex = indexStack.pop();
            const barHeight = histogramValues[topIndex];
            // Calculate width:
            // If stack becomes empty, it means the popped bar is the smallest so far,
            // extending from index 0 to currentPosition - 1. Width is currentPosition.
            // Otherwise, the width is from the index after the new stack top to currentPosition - 1.
            const barWidth = indexStack.length === 0 ? currentPosition : currentPosition - indexStack[indexStack.length - 1] - 1;
            peakArea = Math.max(peakArea, barHeight * barWidth);
        }
        // Push the current bar's index onto the stack.
        indexStack.push(currentPosition);
    }
    return peakArea;
};

let globalMaximum = 0;

while (true) {
    const dimensions = sourceLines.shift().split(" ").map(Number);
    const gridHeight = dimensions[0];
    const gridWidth = dimensions[1];

    if (gridHeight === 0 && gridWidth === 0) {
        break;
    }

    const currentGridRows = [];
    for (let i = 0; i < gridHeight; i++) {
        currentGridRows.push(sourceLines.shift());
    }

    // Construct the height profile matrix using a functional approach (reduce)
    const heightProfileMatrix = currentGridRows.reduce((accumulator, lineContent, rowIndex) => {
        const rowHeights = lineContent.split('').map((charSymbol, colIndex) => {
            if (charSymbol === '*') {
                return 0; // Asterisk means height 0
            }
            // If it's a dot, calculate height based on the previous row's value
            return (rowIndex === 0 ? 0 : accumulator[rowIndex - 1][colIndex]) + 1;
        });
        accumulator.push(rowHeights);
        return accumulator;
    }, []); // Initial accumulator is an empty array

    // Iterate through each row of the height profile matrix
    // and calculate the largest rectangle area for that row (histogram).
    heightProfileMatrix.forEach(rowHistogram => {
        globalMaximum = Math.max(globalMaximum, computeLargestRectangle(rowHistogram));
    });

    console.log(globalMaximum);
    globalMaximum = 0; // Reset for the next grid
}
