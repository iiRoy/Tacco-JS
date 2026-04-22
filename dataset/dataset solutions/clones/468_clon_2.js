// Function to rotate a 2D array (matrix) 90 degrees clockwise.
function spinGridData(inputGrid) {
    // Determine the highest valid index for rows/columns in the square grid.
    var lastElementIndex = inputGrid.length - 1;

    // Create a new array to store the rotated results.
    // Each row is deep-copied to ensure the original inputGrid is not modified.
    var rotatedData = inputGrid.map(function(currentLineValues) {
        return currentLineValues.slice();
    });

    // Iterate through the rows and columns of the original grid.
    for (var outerLoopIndex = 0; outerLoopIndex <= lastElementIndex; outerLoopIndex++) {
        for (var innerLoopIndex = 0; innerLoopIndex <= lastElementIndex; innerLoopIndex++) {
            // Apply the 90-degree clockwise rotation transformation.
            // New position (outerLoopIndex, innerLoopIndex) gets value from original (lastElementIndex - innerLoopIndex, outerLoopIndex).
            rotatedData[outerLoopIndex][innerLoopIndex] = inputGrid[lastElementIndex - innerLoopIndex][outerLoopIndex];
        }
    }
    // Return the newly created rotated matrix.
    return rotatedData;
}

// Function to evaluate if a smaller pattern matrix can be placed
// at a specific top-left coordinate (rowCoord, colCoord) within the larger matrix.
function evaluatePatternMatch(rowCoord, colCoord) {
    // Initialize a variable to store the first matching coordinate, or false if no match yet.
    var firstMatchPoint = false;

    // Loop through the rows of the small pattern matrix.
    for (var patternRowIndex = 0; patternRowIndex < patternDimension; patternRowIndex++) {
        // Loop through the columns of the small pattern matrix.
        for (var patternColIndex = 0; patternColIndex < patternDimension; patternColIndex++) {
            // If the current cell in the pattern matrix is a wildcard (-1), skip comparison.
            if (smallPatternMatrix[patternRowIndex][patternColIndex] === -1) {
                continue; // Move to the next cell in the pattern.
            }

            // If this is the very first non-wildcard match, record its absolute position in the large matrix.
            if (firstMatchPoint === false) {
                firstMatchPoint = [rowCoord + patternRowIndex, colCoord + patternColIndex];
            }

            // Compare the cell in the large matrix with the corresponding cell in the pattern matrix.
            // If they do not match, this placement is invalid.
            if (largeMatrix[rowCoord + patternRowIndex][colCoord + patternColIndex] !== smallPatternMatrix[patternRowIndex][patternColIndex]) {
                return false; // Immediately return false on the first mismatch.
            }
        }
    }
    // If the entire pattern matched successfully, return the coordinates of the first match.
    return firstMatchPoint;
}


// --- Main Program Logic Starts Here ---

// Obtain the Node.js 'fs' (file system) module for input operations.
var fileSystemModule = require('fs');

// Read the entire content of the standard input file, converting it to a UTF-8 string.
var fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: remove leading/trailing whitespace and split into an array of lines.
var inputLinesArray = fileContent.trim().split("\n");

// Begin an infinite loop to process multiple test cases.
while (true) {
    // Extract the first line from the input array, split it by space,
    // and convert the resulting string parts into numbers.
    var dimensionsPair = inputLinesArray.shift().split(" ").map(Number);

    // Assign the two extracted dimensions to meaningful variables.
    var mainGridDimension = dimensionsPair[0];   // The size of the main N x N grid.
    var patternDimension = dimensionsPair[1]; // The size of the smaller M x M pattern grid.

    // Check for the problem's termination condition: N=0 and M=0.
    if (mainGridDimension === 0 && patternDimension === 0) {
        break; // Exit the processing loop.
    }

    // Initialize the large matrix (mainGridDimension x mainGridDimension).
    var largeMatrix = [];
    // Populate the large matrix by reading 'mainGridDimension' number of lines.
    for (var outerLoopIndex = 0; outerLoopIndex < mainGridDimension; outerLoopIndex++) {
        // For each line, split by space, and convert values to numbers.
        var currentLineValues = inputLinesArray.shift().split(" ").map(Number);
        largeMatrix.push(currentLineValues); // Add the parsed row to the large matrix.
    }

    // Initialize the small pattern matrix (patternDimension x patternDimension).
    var smallPatternMatrix = [];
    // Populate the small pattern matrix by reading 'patternDimension' number of lines.
    for (var outerLoopIndex = 0; outerLoopIndex < patternDimension; outerLoopIndex++) {
        // For each line, split by space, and convert values to numbers.
        var currentLineValues = inputLinesArray.shift().split(" ").map(Number);
        smallPatternMatrix.push(currentLineValues); // Add the parsed row to the pattern matrix.
    }

    // Initialize a variable to hold the best matching position found so far.
    // Use a large, impossible coordinate (e.g., 101, 101) as initial value.
    var optimalPosition = [101, 101];

    // Iterate through four possible rotations (0, 90, 180, 270 degrees) of the pattern matrix.
    for (var rotationCounter = 0; rotationCounter < 4; rotationCounter++) {
        // Iterate through all possible top-left starting row coordinates for placement.
        for (var outerLoopIndex = 0; outerLoopIndex <= mainGridDimension - patternDimension; outerLoopIndex++) {
            // Iterate through all possible top-left starting column coordinates for placement.
            for (var innerLoopIndex = 0; innerLoopIndex <= mainGridDimension - patternDimension; innerLoopIndex++) {
                // Attempt to find a match for the current rotation of the pattern matrix
                // starting at (outerLoopIndex, innerLoopIndex) within the large matrix.
                var matchResult = evaluatePatternMatch(outerLoopIndex, innerLoopIndex);

                // If a valid match was found (matchResult is not false).
                if (matchResult !== false) {
                    // Adjust matchResult coordinates by +1 for 1-based indexing as per output format.
                    var adjustedRow = matchResult[0] + 1;
                    var adjustedCol = matchResult[1] + 1;

                    // Check if this new match is better than the current optimal position.
                    // First, compare by row index.
                    if (optimalPosition[0] > adjustedRow) {
                        optimalPosition = [adjustedRow, adjustedCol];
                    }
                    // If rows are the same, compare by column index.
                    else if (optimalPosition[0] === adjustedRow && optimalPosition[1] > adjustedCol) {
                        optimalPosition = [adjustedRow, adjustedCol];
                    }
                }
            }
        }
        // After checking all possible placements for the current rotation,
        // rotate the small pattern matrix for the next iteration.
        smallPatternMatrix = spinGridData(smallPatternMatrix);
    }

    // Prepare the final output message.
    // If the optimalPosition is still the initial impossible value, it means no match was found.
    if (optimalPosition.join("") === "101101") {
        console.log("NA"); // Output "NA" indicating no match.
    } else {
        // Otherwise, output the found column and row coordinates.
        // Note: The original code outputs min[1] then min[0]. Let's stick to that.
        console.log(optimalPosition[1] + " " + optimalPosition[0]);
    }
}