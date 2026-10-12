var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input data by trimming and splitting into lines.
var lineSegments = rawData.trim().split("\n");

while (true) {
    // Extract dimensions for the current test case.
    var dimensionsStr = lineSegments.shift().split(" ");

    // Check for termination condition (0 0).
    if (dimensionsStr.join(" ") === "0 0") {
        break;
    }

    // Parse N and M values.
    var numRows = dimensionsStr[0];
    var numCols = dimensionsStr[1];

    // Read M values into an array.
    var colValues = [];
    for (var colIdx = 0; colIdx < numCols; colIdx++) {
        colValues.push(lineSegments.shift() - 0); // Convert to number
    }

    // Read N values into another array.
    var rowValues = [];
    for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
        rowValues.push(lineSegments.shift() - 0); // Convert to number
    }

    // Initialize the dynamic programming table.
    var dynamicProgTable = [];
    for (var rowIndex = 0; rowIndex <= numRows; rowIndex++) {
        dynamicProgTable[rowIndex] = [];
        for (var pixelVal = 0; pixelVal <= 255; pixelVal++) {
            dynamicProgTable[rowIndex][pixelVal] = Infinity;
        }
    }

    // Base case: starting pixel value at row 0.
    dynamicProgTable[0][128] = 0;

    // Fill the DP table.
    for (var rowIndex = 1; rowIndex <= numRows; rowIndex++) {
        for (var pixelVal = 0; pixelVal <= 255; pixelVal++) {
            for (var colIdx = 0; colIdx < numCols; colIdx++) {
                var adjustedPixelVal = pixelVal + colValues[colIdx];

                // Clamp the pixel value to [0, 255].
                if (adjustedPixelVal < 0) {
                    adjustedPixelVal = 0;
                }
                if (adjustedPixelVal > 255) {
                    adjustedPixelVal = 255;
                }

                // Update DP table if a valid path exists.
                if (dynamicProgTable[rowIndex - 1][pixelVal] !== Infinity) {
                    dynamicProgTable[rowIndex][adjustedPixelVal] = Math.min(
                        dynamicProgTable[rowIndex][adjustedPixelVal],
                        dynamicProgTable[rowIndex - 1][pixelVal] + Math.pow(rowValues[rowIndex - 1] - adjustedPixelVal, 2)
                    );
                }
            }
        }
    }

    // Find the minimum cost in the last row of the DP table.
    var minimumCost = Infinity;
    dynamicProgTable[numRows].forEach(function(currentCost) {
        minimumCost = Math.min(minimumCost, currentCost);
    });

    // Output the result for the current test case.
    console.log(minimumCost);
}
