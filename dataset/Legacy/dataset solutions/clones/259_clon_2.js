/*
 * Configuration parameters for the application.
 */
var configData = {};

/*
 * A two-dimensional array representing the grid.
 * Elements can be -1 (right side of a horizontal bar), 0 (no bar), or 1 (left side of a horizontal bar).
 */
var gridMatrix = [];

/**
 * Computes the path from a given starting column and optional starting row.
 * @param {number} initialColumn - The starting column index.
 * @param {number} [initialRow=0] - The starting row index.
 * @returns {number[]} An array of column indices representing the path.
 */
var tracePathForward = function(initialColumn, initialRow) {
    // If no initial row is provided, default to the first row.
    if (!initialRow) {
        initialRow = 0;
    }
    var currentPosition = initialColumn;
    var pathSequence = [currentPosition]; // Initialize path with the starting position.

    // Iterate through the grid rows from the initial row.
    for (var rowIndex = initialRow; rowIndex < gridMatrix.length; rowIndex++) {
        // Update the current position based on the grid value at the current row and position.
        currentPosition += gridMatrix[rowIndex][currentPosition];
        pathSequence.push(currentPosition); // Add the new position to the path.
    }
    return pathSequence;
};

/**
 * Computes the path backwards from a specified ending column.
 * The returned path is ordered from start to end.
 * @param {number} finalColumn - The target ending column index.
 * @returns {number[]} An array of column indices representing the path from start to end.
 */
var tracePathBackward = function(finalColumn) {
    var currentPosition = finalColumn;
    var pathSequence = [currentPosition]; // Initialize path with the ending position.

    // Iterate through the grid rows in reverse order.
    for (var rowIndex = gridMatrix.length - 1; rowIndex >= 0; rowIndex--) {
        // Update the current position based on the grid value.
        // Note: The logic for moving backwards is the same as forwards because the grid values
        // already represent the relative movement.
        currentPosition += gridMatrix[rowIndex][currentPosition];
        pathSequence.push(currentPosition); // Add the new position to the path.
    }
    return pathSequence.reverse(); // Reverse the path to get it from start to end.
};

// Array to store all incoming lines from standard input.
var inputLines = [];

// Set up standard input processing.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function (dataBlock) {
    // Trim whitespace and split the chunk into individual lines, then add to inputLines.
    dataBlock.trim().split('\n').forEach(function(singleLine) {
        inputLines.push(singleLine);
    });
});
 
// Event listener for the end of standard input.
process.stdin.on('end', function() {
    var finalOutcome = ""; // Variable to store the final result string.

    // Reset configuration and grid data for processing.
    configData = {};
    gridMatrix = [];

    // Process each line from the input.
    for (var lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
        var currentLineContent = inputLines[lineIndex];
        // Stop processing if a "0" is encountered, indicating end of input data.
        if (currentLineContent == "0") {
            break;
        }
    
        // Define the keys for the initial configuration settings.
        var settingKeys = ["lines", "start", "end", "steps"];
        if (lineIndex < settingKeys.length) {
            // Parse the first few lines as configuration values.
            configData[settingKeys[lineIndex]] = parseInt(currentLineContent);
            continue; // Move to the next input line.
        }
    
        // For lines beyond the configuration settings, parse them into the grid matrix.
        var gridRow = [];
        // Iterate up to (number of lines - 1) to parse column values.
        for (var columnIndex = 0; columnIndex < configData.lines - 1; columnIndex++) {
            var parsedCharValue = parseInt(currentLineContent.charAt(columnIndex));
            // Adjust value if it's a '0' and the previous element was '1' (representing a horizontal bar).
            if (columnIndex > 0 && parsedCharValue == 0 && gridRow[columnIndex - 1] == 1) {
                parsedCharValue = -1;
            }
            gridRow.push(parsedCharValue); // Add the parsed value to the current grid row.
        }
        // Add the last element to the row based on the second-to-last element.
        gridRow.push((gridRow[gridRow.length - 1] == 1) ? -1 : 0);
        gridMatrix.push(gridRow); // Add the completed row to the grid matrix.
    }

    // Adjust start and end positions to be 0-indexed.
    configData.start -= 1;
    configData.end -= 1;
    
    // Calculate the forward path from the starting point.
    var forwardPath = tracePathForward(configData.start);
    // If the forward path reaches the desired end point, output "0".
    if (forwardPath[forwardPath.length - 1] == configData.end) {
        console.log("0");
        return; // Exit the function.
    }

    // Calculate the reverse path from the ending point.
    var reversePath = tracePathBackward(configData.end);
    
    // Iterate through the specified number of steps to find a potential modification point.
    for (var rowIndex = 0; rowIndex < configData.steps; rowIndex++) {
        // Check if the paths are adjacent and both positions have no bar in the current row.
        if (Math.abs(forwardPath[rowIndex] - reversePath[rowIndex]) == 1 && 
            gridMatrix[rowIndex][forwardPath[rowIndex]] == 0 && 
            gridMatrix[rowIndex][reversePath[rowIndex]] == 0) {
            // If conditions met, construct the result string.
            finalOutcome = (rowIndex + 1) + " " + (Math.min(forwardPath[rowIndex], reversePath[rowIndex]) + 1);
            break; // Found a solution, exit the loop.
        }
    }

    // If no solution was found, set the result to "1".
    if (finalOutcome == "") {
        finalOutcome = "1";
    }
    
    // Output the final result.
    console.log(finalOutcome);
});
