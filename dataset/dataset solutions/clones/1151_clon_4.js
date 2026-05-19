var outputResult = console.log;

if (typeof process !== "undefined") {
    var rawInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        rawInputBuffer += chunk;
    });
    process.stdin.on('end', function() {
        var inputLines = rawInputBuffer.split("\n");
        processGridData(inputLines);
    });
}

//-----

// This helper function computes the largest rectangle area within a given histogram (array of heights).
// It uses a stack-based approach, which is a standard algorithm for this problem.
function findMaxRectangleInHistogram(heightsArray, widthLimit) {
    let maxHistogramArea = 0;
    let stackIndices = []; // Stores indices of bars in increasing order of height

    // Iterate through all bars, including a virtual bar of height 0 at the end
    // to ensure all elements in the stack are processed.
    for (let currentColumn = 0; currentColumn <= widthLimit; currentColumn++) {
        let currentBarHeight = (currentColumn === widthLimit) ? 0 : heightsArray[currentColumn];

        // While the stack is not empty and the current bar is shorter than the bar at the top of the stack,
        // pop elements from the stack and calculate the area they could form.
        while (stackIndices.length > 0 && currentBarHeight < heightsArray[stackIndices[stackIndices.length - 1]]) {
            let poppedIndex = stackIndices.pop();
            let barHeight = heightsArray[poppedIndex];
            
            // Calculate the width of the rectangle formed by the popped bar.
            // If the stack is empty, it means the popped bar extends to the very beginning (index 0).
            // Otherwise, it extends from the index of the new top of the stack + 1.
            let barWidth = (stackIndices.length === 0) ? currentColumn : currentColumn - stackIndices[stackIndices.length - 1] - 1;
            
            maxHistogramArea = Math.max(maxHistogramArea, barHeight * barWidth);
        }
        // Push the current column index onto the stack.
        stackIndices.push(currentColumn);
    }
    return maxHistogramArea;
}


function processGridData(inputLines) {
    // Parse input data, using different variable names.
    var numericGridData = inputLines.map(line => line.split(" ").map(valStr => Number(valStr)));
    var dimensions = numericGridData.shift();
    var gridHeight = dimensions[0];
    var gridWidth = dimensions[1];

    var overallMaximumArea = 0;

    // This array will dynamically store the heights of consecutive zeros for the current row.
    // Each element currentHistogramHeights[colIndex] represents the height of the column of zeros
    // ending at (rowIndex, colIndex). It effectively forms a histogram for each row.
    var currentHistogramHeights = new Array(gridWidth).fill(0);

    // Iterate through each row of the grid.
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        // Update the histogram heights based on the current row's cell values.
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            let cellValue = numericGridData[rowIndex][colIndex];
            if (cellValue === 1) {
                // If the cell contains '1', the column of consecutive zeros is broken,
                // so its height is reset to 0.
                currentHistogramHeights[colIndex] = 0;
            } else {
                // If the cell contains '0', the column of consecutive zeros extends upwards,
                // so its height is incremented from the previous row's height.
                currentHistogramHeights[colIndex]++;
            }
        }

        // After updating the histogram heights for the current row,
        // find the largest rectangle area that can be formed within this histogram.
        let maxAreaInCurrentRow = findMaxRectangleInHistogram(currentHistogramHeights, gridWidth);
        
        // Update the overall maximum area found so far.
        overallMaximumArea = Math.max(overallMaximumArea, maxAreaInCurrentRow);
    }

    // Output the final maximum area.
    outputResult(overallMaximumArea);
}
