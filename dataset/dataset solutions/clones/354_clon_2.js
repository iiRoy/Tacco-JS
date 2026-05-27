var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineSegments = rawData.trim().split("\n"); // Split input into an array of lines, removing leading/trailing whitespace

// Process each set of dimensions until "0 0" is encountered
while (true) {
    // Extract height and width from the current line, convert to numbers
    var dimensions = lineSegments.shift().split(" ").map(Number);

    // Check for termination condition
    if (dimensions.join(" ") === "0 0") {
        break;
    }

    var rowsCount = dimensions[0]; // Store the number of rows
    var colsCount = dimensions[1]; // Store the number of columns

    // Initialize a 2D array to store calculated heights of consecutive '.' characters
    var heightMap = [];

    // Iterate through each row of the input grid
    for (var rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
        var currentLine = lineSegments.shift().split(""); // Get the current row as an array of characters
        heightMap[rowIndex] = []; // Initialize the current row in the height map

        // Process each character in the current row
        currentLine.forEach(function(charVal, colIndex) {
            if (rowIndex === 0 && charVal === ".") {
                // If it's the first row and the character is '.', height is 1
                heightMap[rowIndex][colIndex] = 1;
            } else if (rowIndex === 0 && charVal !== ".") {
                // If it's the first row and not '.', height is 0
                heightMap[rowIndex][colIndex] = 0;
            } else if (rowIndex !== 0 && charVal === ".") {
                // If not the first row and '.', height is previous row's height + 1
                heightMap[rowIndex][colIndex] = heightMap[rowIndex - 1][colIndex] + 1;
            } else if (rowIndex !== 0 && charVal !== ".") {
                // If not the first row and not '.', height is 0
                heightMap[rowIndex][colIndex] = 0;
            }
        });
    }

    var greatestArea = 0; // Variable to store the maximum area found

    // Iterate through each row of the calculated height map
    for (var currentRow = 0; currentRow < rowsCount; currentRow++) {
        var heightStack = []; // Stack to keep track of heights and their starting column indices
        heightMap[currentRow][colsCount] = 0; // Add a sentinel value to ensure all elements in stack are processed

        // Iterate through each column (including the sentinel)
        for (var currentCol = 0; currentCol <= colsCount; currentCol++) {
            var currentHeight = heightMap[currentRow][currentCol]; // Get the current height value

            // If the stack is empty, push the current height and column
            if (heightStack.length === 0) {
                heightStack.push([currentHeight, currentCol]);
                continue;
            }

            // If current height is greater than the top of the stack, push it
            if (heightStack[heightStack.length - 1][0] < currentHeight) {
                heightStack.push([currentHeight, currentCol]);
            }
            // If current height is equal to the top of the stack, do nothing (skip)
            else if (heightStack[heightStack.length - 1][0] === currentHeight) {
                continue;
            }
            // If current height is less than the top of the stack, pop elements
            else if (heightStack[heightStack.length - 1][0] > currentHeight) {
                var lastPoppedIndex; // Variable to store the column index of the last popped element

                while (true) {
                    // If stack becomes empty, push current height with the last popped index
                    if (heightStack.length === 0) {
                        heightStack.push([currentHeight, lastPoppedIndex]);
                        break;
                    }

                    var poppedElement = heightStack.pop(); // Pop an element from the stack

                    // If current height is greater than the popped height, push current height with lastPoppedIndex
                    if (currentHeight > poppedElement[0]) {
                        heightStack.push([currentHeight, lastPoppedIndex]);
                        break;
                    }
                    lastPoppedIndex = poppedElement[1]; // Update lastPoppedIndex

                    // If current height is equal to popped height, break
                    if (currentHeight === poppedElement[0]) {
                        break;
                    }
                    // If current height is less than or equal to popped height, calculate area
                    else if (currentHeight <= poppedElement[0]) {
                        greatestArea = Math.max(greatestArea, poppedElement[0] * (currentCol - poppedElement[1]));
                    }
                }
            }
        }
    }
    console.log(greatestArea); // Output the maximum area for the current grid
}
