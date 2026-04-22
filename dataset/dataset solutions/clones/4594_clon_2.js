// Utility function to convert a string to an integer value
function parseInteger(inputString) {
    return Number.parseInt(inputString, 10);
}

// Utility function to convert a string to a floating-point number
function parseFloatNumber(valueString) {
    return parseFloat(valueString);
}

// Determines if a given numeric value is an even number
function isEvenlyDivisible(numberValue) {
    return (numberValue % 2) === 0;
}

// Determines if a given numeric value is an odd number
function isOddlyDivisible(numberValue) {
    return (numberValue % 2) === 1;
}

// Extends the Array prototype with various sorting and filtering methods
Array.prototype.orderNumbersAscending = function() {
    // Sorts array elements numerically in ascending order
    return this.sort((first, second) => (first - second));
};
Array.prototype.orderNumbersDescending = function() {
    // Sorts array elements numerically in descending order
    return this.sort((first, second) => (second - first));
};
Array.prototype.orderStringsAlphabetically = function() {
    // Sorts array elements as strings in ascending alphabetical order
    return this.sort();
};
Array.prototype.orderStringsReverseAlphabetically = function() {
    // Sorts array elements as strings in descending alphabetical order
    return this.sort().reverse();
};
Array.prototype.filterOutElement = function(excludedItem) {
    // Returns a new array with all occurrences of 'excludedItem' removed
    return this.filter(elementInArray => elementInArray !== excludedItem);
};

// Main function to process the challenge input and determine the solution
function processInputData(inputLines) {
    // Parse the first line of input to extract grid dimensions and the maximum allowed steps
    var dimensionsArray = inputLines[0].split(' ').map(parseInteger);
    var gridHeight = dimensionsArray[0]; // Height of the grid
    var gridWidth = dimensionsArray[1];  // Width of the grid
    var maxSteps = dimensionsArray[2];   // Maximum steps allowed for movement

    // Initialize variables for the starting point and the game grid itself
    var startingPosition = []; // Stores the [row, column] of the 'S' character
    // Convert remaining input lines into a 2D array representing the grid
    var gameGrid = inputLines.slice(1).map(lineContent => lineContent.split(''));

    // Loop through the grid to locate the starting point 'S'
    initialScan:
    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
            if (gameGrid[rowIdx][colIdx] === 'S') {
                startingPosition = [rowIdx, colIdx];
                break initialScan; // Exit both loops once 'S' is found
            }
        }
    }

    // Recursive depth-first search function to explore reachable cells within 'maxSteps'
    function exploreGrid(currentRow, currentCol, currentStep) {
        // Base case: If the current number of steps exceeds the maximum allowed, terminate this path
        if (currentStep > maxSteps) {
            return;
        }
        // Base case: If the current coordinates are outside the grid boundaries, terminate this path
        if (currentRow < 0 || gridHeight <= currentRow || currentCol < 0 || gridWidth <= currentCol) {
            return;
        }

        var cellContent = gameGrid[currentRow][currentCol]; // Get the content of the current cell

        // Conditions for marking a cell as visited with the current step count:
        // 1. The cell is empty ('.')
        // 2. The cell is the starting point ('S')
        // 3. The cell has been previously visited but with a higher step count,
        //    meaning we found a shorter path to it.
        if (
            cellContent === '.' ||
            cellContent === 'S' ||
            (typeof cellContent === 'number' && cellContent > currentStep)
        ) {
            gameGrid[currentRow][currentCol] = currentStep; // Mark the cell with the current step count

            // Recursively explore all four adjacent cells, incrementing the step count
            exploreGrid(currentRow - 1, currentCol, currentStep + 1); // Move Up
            exploreGrid(currentRow + 1, currentCol, currentStep + 1); // Move Down
            exploreGrid(currentRow, currentCol - 1, currentStep + 1); // Move Left
            exploreGrid(currentRow, currentCol + 1, currentStep + 1); // Move Right
        }
    }

    // Initiate the grid exploration starting from the identified 'S' position with 0 steps taken
    exploreGrid(startingPosition[0], startingPosition[1], 0);

    // Helper function to compute the minimum number of steps from a given cell
    // to any of the grid's four boundaries (top, bottom, left, right)
    function calculateMinStepsToBoundary(currRow, currCol) {
        var distToBottom = (gridHeight - 1) - currRow;
        var distToTop = currRow;
        var distToRight = (gridWidth - 1) - currCol;
        var distToLeft = currCol;
        return Math.min(distToBottom, distToTop, distToRight, distToLeft);
    }

    var finalMinimumSteps = Number.POSITIVE_INFINITY; // Initialize the minimum steps to a very large value

    // Second pass through the grid to determine the overall minimum steps to exit
    exitScan:
    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
            var cellValue = gameGrid[rowIdx][colIdx];

            // Only consider cells that were successfully reached during the exploration (marked with a number)
            if (typeof cellValue === 'number') {
                var boundarySteps = calculateMinStepsToBoundary(rowIdx, colIdx);

                // If a reachable cell is directly on a boundary (0 steps to boundary)
                if (boundarySteps === 0) {
                    finalMinimumSteps = 1; // It takes 1 step to exit from this boundary cell
                    break exitScan; // Since 1 is the minimum possible, we can stop searching
                }

                // Calculate the total steps required:
                // steps to reach this cell (`cellValue`) +
                // steps to reach the boundary from this cell, considering `maxSteps` per jump (`Math.ceil(boundarySteps / maxSteps)`) +
                // 1 additional step for the final exit.
                finalMinimumSteps = Math.min(finalMinimumSteps, Math.ceil(boundarySteps / maxSteps) + 1);
            }
        }
    }

    // Output the computed final minimum steps to the console
    console.log(finalMinimumSteps);
}

// Execute the main processing function by reading input from stdin
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));