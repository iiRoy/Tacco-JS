var rawInputText = require('fs').readFileSync('/dev/stdin', 'utf8');

var inputLineArray = rawInputText.trim().split("\n"); // Prepares input by splitting lines

while (true) { // Loop for processing multiple test cases
    var currentDimensionPair = inputLineArray.shift().split(" "); // Extracts N and M from the current line

    if (currentDimensionPair.join(" ") === "0 0") { // Check for termination condition
        break; // Exit the main processing loop
    }

    var countN = currentDimensionPair[0]; // First dimension size
    var countM = currentDimensionPair[1]; // Second dimension size

    var mValueCollection = []; // Array to hold 'M' values
    for (var loopIndexM = 0; loopIndexM < countM; loopIndexM++) {
        mValueCollection.push(inputLineArray.shift() - 0); // Read M values, convert to number
    }

    var nValueCollection = []; // Array to hold 'N' values
    for (var loopIndexN = 0; loopIndexN < countN; loopIndexN++) {
        nValueCollection.push(inputLineArray.shift() - 0); // Read N values, convert to number
    }

    var dpCostTable = []; // Dynamic programming table initialization
    for (var rowIndex = 0; rowIndex <= countN; rowIndex++) {
        dpCostTable[rowIndex] = [];
        for (var colIndex = 0; colIndex <= 255; colIndex++) {
            dpCostTable[rowIndex][colIndex] = Number.POSITIVE_INFINITY; // Initialize with a very high cost
        }
    }

    dpCostTable[0][128] = 0; // Set the initial base case for DP

    // Main dynamic programming calculation loop
    for (var currentRowIndex = 1; currentRowIndex <= countN; currentRowIndex++) {
        for (var currentColumnState = 0; currentColumnState <= 255; currentColumnState++) {
            // Only proceed if the previous state was reachable
            if (dpCostTable[currentRowIndex - 1][currentColumnState] !== Number.POSITIVE_INFINITY) {
                for (var mValueIndex = 0; mValueIndex < countM; mValueIndex++) {
                    var adjustedStateValue = currentColumnState + mValueCollection[mValueIndex]; // Calculate new state

                    // Clamp the state value to stay within the valid range [0, 255]
                    if (adjustedStateValue < 0) {
                        adjustedStateValue = 0;
                    }
                    if (adjustedStateValue > 255) {
                        adjustedStateValue = 255;
                    }

                    // Update the DP table with the minimum cost to reach the current state
                    dpCostTable[currentRowIndex][adjustedStateValue] = Math.min(
                        dpCostTable[currentRowIndex][adjustedStateValue],
                        dpCostTable[currentRowIndex - 1][currentColumnState] + Math.pow(nValueCollection[currentRowIndex - 1] - adjustedStateValue, 2)
                    );
                }
            }
        }
    }

    var totalMinimumCost = Number.POSITIVE_INFINITY; // Variable to store the final minimum cost
    // Iterate through the last row of the DP table to find the overall minimum
    dpCostTable[countN].forEach(function (entryValue) {
        totalMinimumCost = Math.min(totalMinimumCost, entryValue);
    });

    console.log(totalMinimumCost); // Output the computed minimum cost
}