const dataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let lineCursor = 0;

// Helper function to calculate the largest rectangle in a histogram row
const calculateHistogramMax = (histogramValues, width) => {
    let currentMax = 0;
    const valueStack = []; // Stores { val: height, pos: start_index }

    // Append a sentinel value (0) to ensure all bars in the stack are processed
    const processedHistogram = [...histogramValues, 0];

    for (let p = 0; p < processedHistogram.length; p++) {
        const currentHeightVal = processedHistogram[p];
        
        // Case 1: Stack is empty or current height is strictly greater than the top of the stack
        // This corresponds to original's `if(s.length==0)` and `if(s[s.length-1][0]<v)`
        if (valueStack.length === 0 || valueStack[valueStack.length - 1].val < currentHeightVal) {
            valueStack.push({ val: currentHeightVal, pos: p });
            continue;
        }

        // Case 2: Current height is equal to the top of the stack
        // This corresponds to original's `else if(s[s.length-1][0]==v)continue;`
        if (valueStack[valueStack.length - 1].val === currentHeightVal) {
            continue;
        }

        // Case 3: Current height is smaller than the top of the stack
        // This corresponds to original's `else if(s[s.length-1][0]>v)` block
        let lastPoppedStart = p; // This variable mimics `last` from the original code
        
        // Mimic the original's `while(true)` loop for popping elements
        for (;;) {
            if (valueStack.length === 0) {
                valueStack.push({ val: currentHeightVal, pos: lastPoppedStart });
                break;
            }
            const poppedItem = valueStack.pop();
            if (currentHeightVal > poppedItem.val) {
                valueStack.push({ val: currentHeightVal, pos: lastPoppedStart });
                break;
            }
            lastPoppedStart = poppedItem.pos; // Update `lastPoppedStart` with the position of the popped item
            if (currentHeightVal === poppedItem.val) {
                break; // Original's `if(v==r[0])break;`
            } else { // currentHeightVal < poppedItem.val (original `else if(v<=r[0])`)
                currentMax = Math.max(currentMax, poppedItem.val * (p - poppedItem.pos));
            }
        }
    }
    return currentMax;
};

let globalMaxArea = 0;

// Main loop for processing multiple test cases
for (;;) {
    const dimensionsStr = dataLines[lineCursor++];
    const [rowDim, colDim] = dimensionsStr.split(' ').map(Number);

    if (rowDim === 0 && colDim === 0) {
        break;
    }

    // Generate the height matrix (equivalent to `yx` in original)
    // Each cell stores the height of consecutive '.' characters upwards
    const heightMatrix = Array.from({ length: rowDim }, (_, rIdx) => {
        const rowChars = dataLines[lineCursor++].split('');
        return Array.from({ length: colDim }, (_, cIdx) => {
            const char = rowChars[cIdx];
            if (char === '.') {
                // If it's the first row, height is 1. Otherwise, it's 1 + height from cell above.
                return (rIdx === 0) ? 1 : heightMatrix[rIdx - 1][cIdx] + 1;
            } else {
                // If it's not '.', height is 0.
                return 0;
            }
        });
    });

    // Iterate through each row of the height matrix and calculate the largest rectangle
    for (let r = 0; r < rowDim; r++) {
        globalMaxArea = Math.max(globalMaxArea, calculateHistogramMax(heightMatrix[r], colDim));
    }

    console.log(globalMaxArea);
    globalMaxArea = 0; // Reset for the next test case
}
