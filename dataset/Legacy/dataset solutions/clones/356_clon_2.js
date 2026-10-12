var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process input data, splitting by newlines and removing leading/trailing whitespace
var lineSegments = rawData.trim().split("\n");

// Main loop to process multiple test cases
while (true) {
    // Read dimensions (height and width) for the current test case
    var dims = lineSegments.shift().split(" ").map(Number);

    // Check for termination condition (0 0)
    if (dims.join(" ") === "0 0") {
        break;
    }

    // Extract height and width
    var heightVal = dims[0];
    var widthVal = dims[1];

    // Initialize a 2D array to store processed matrix data
    // This matrix will store the height of consecutive '.' characters upwards
    var matrixData = [];

    // Populate the matrixData based on input characters
    for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        // Get the current row of characters
        var rowChars = lineSegments.shift().split("");
        matrixData[rowIdx] = []; // Initialize the current row in matrixData

        // Iterate through each character in the row
        rowChars.forEach(function(charVal, colIdx) {
            if (rowIdx === 0 && charVal === ".") {
                // If it's the first row and a '.', set height to 1
                matrixData[rowIdx][colIdx] = 1;
            } else if (rowIdx === 0 && charVal !== ".") {
                // If it's the first row and not a '.', set height to 0
                matrixData[rowIdx][colIdx] = 0;
            } else if (rowIdx !== 0 && charVal === ".") {
                // If not the first row and a '.', add 1 to the height from the cell above
                matrixData[rowIdx][colIdx] = matrixData[rowIdx - 1][colIdx] + 1;
            } else if (rowIdx !== 0 && charVal !== ".") {
                // If not the first row and not a '.', set height to 0
                matrixData[rowIdx][colIdx] = 0;
            }
        });
    }

    // Variable to store the maximum area found
    var greatestArea = 0;

    // Iterate through each row of the processed matrix to find the largest rectangle
    for (var currentR = 0; currentR < heightVal; currentR++) {
        // Stack to keep track of heights and their starting column indices
        var stackOfHeights = [];
        // Add a sentinel value (0) at the end of each row to ensure all elements in the stack are processed
        matrixData[currentR][widthVal] = 0;

        // Iterate through each column (including the sentinel)
        for (var currentC = 0; currentC <= widthVal; currentC++) {
            var currentH = matrixData[currentR][currentC]; // Current height value

            if (stackOfHeights.length === 0) {
                // If stack is empty, push the current height and its starting column
                stackOfHeights.push([currentH, currentC + 1]);
                continue;
            }

            // Compare current height with the top of the stack
            if (stackOfHeights[stackOfHeights.length - 1][0] < currentH) {
                // If current height is greater, push it onto the stack
                stackOfHeights.push([currentH, currentC]);
            } else if (stackOfHeights[stackOfHeights.length - 1][0] === currentH) {
                // If current height is equal, do nothing (it extends the previous rectangle)
                continue;
            } else if (stackOfHeights[stackOfHeights.length - 1][0] > currentH) {
                // If current height is smaller, pop elements from the stack
                // and calculate areas until a smaller or equal height is found
                while (stackOfHeights.length !== 0) {
                    var poppedItem = stackOfHeights.pop();
                    if (currentH > poppedItem[0]) {
                        // If current height is greater than the popped item, push the popped item back
                        // and then push the current height. This means the popped item forms a rectangle
                        // that ends before the current column.
                        stackOfHeights.push(poppedItem);
                        break;
                    } else if (currentH === poppedItem[0]) {
                        // If current height is equal to the popped item, stop processing.
                        // The popped item's rectangle extends to the current column.
                        break;
                    } else if (currentH < poppedItem[0]) {
                        // If current height is smaller than the popped item, calculate the area
                        // of the rectangle formed by the popped item.
                        greatestArea = Math.max(greatestArea, poppedItem[0] * ((currentC + 1) - poppedItem[1]));
                    }
                }
            }
        }
    }
    // Output the maximum area found for the current test case
    console.log(greatestArea);
}
