// Configuration settings for the process.
var configData = {};

// A 2D rectangular array. Elements are -1 (right side of a bar), 0 (no bar), or 1 (left side of a bar).
var gridMatrix = [];

// Function to determine the path from a starting point.
var tracePath = function(initialRow, initialCol) {
    // If no starting column is provided, default to 0.
    if (!initialCol) {
        initialCol = 0;
    }
    // Initialize the current position.
    var currentPos = initialRow;
    // Store the path taken.
    var pathHistory = [currentPos];

    // Iterate through each row of the grid matrix.
    for (var rowIndex = initialCol; rowIndex < gridMatrix.length; rowIndex++) {
        // Update the current position based on the grid value.
        currentPos += gridMatrix[rowIndex][currentPos];
        // Add the new position to the path history.
        pathHistory.push(currentPos);
    }
    // Return the complete path.
    return pathHistory;
};

// Function to determine the path backwards from an ending point.
var reverseTracePath = function(finalRow) {
    // Initialize the current position for reverse tracing.
    var currentPosRev = finalRow;
    // Store the path taken in reverse.
    var reversePathHistory = [currentPosRev];

    // Iterate backwards through each row of the grid matrix.
    for (var rowIndexRev = gridMatrix.length - 1; rowIndexRev >= 0; rowIndexRev--) {
        // Update the current position based on the grid value.
        currentPosRev += gridMatrix[rowIndexRev][currentPosRev];
        // Add the new position to the reverse path history.
        reversePathHistory.push(currentPosRev);
    }
    // Return the reversed path to get it in forward order.
    return reversePathHistory.reverse();
};

// Array to hold all input lines from stdin.
var inputLines = [];

// Set up standard input processing.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
    // Split the chunk by newlines, trim each line, and add to inputLines.
    dataChunk.trim().split('\n').forEach(function(singleLine) {
        inputLines.push(singleLine);
    });
});

// Event listener for the end of standard input.
process.stdin.on('end', function() {
    var finalOutput = ""; // Initialize the output string.

    // Reset configuration and grid data for processing.
    configData = {};
    gridMatrix = [];

    // Process each line of input.
    for (var idx = 0; idx < inputLines.length; idx++) {
        var currentElement = inputLines[idx];

        // If the line is "0", it signifies the end of input data.
        if (currentElement == "0") {
            break;
        }

        // Define keys for initial configuration parameters.
        var definitionKeys = ["lines", "start", "end", "steps"];

        // Parse initial configuration values.
        if (idx < definitionKeys.length) {
            configData[definitionKeys[idx]] = parseInt(currentElement);
            // Continue to the next line after parsing a config value.
            continue;
        }

        // For lines after the initial configuration (idx >= 4).
        var currentRowData = [];
        // Iterate to populate the current row of the grid matrix.
        for (var j = 0; j < configData.lines - 1; j++) {
            var charValue = parseInt(currentElement.charAt(j));
            // Adjust value if it's a '0' following a '1' to represent a right bar.
            if (j > 0 && charValue == 0 && currentRowData[j - 1] == 1) {
                charValue = -1;
            }
            currentRowData.push(charValue);
        }
        // Add the last element of the row based on the previous one.
        currentRowData.push((currentRowData[currentRowData.length - 1] == 1) ? -1 : 0);
        gridMatrix.push(currentRowData); // Add the completed row to the grid matrix.
    }

    // Adjust start and end values to be 0-indexed.
    configData.start -= 1;
    configData.end -= 1;

    // Calculate the forward route from the starting point.
    var forwardRoute = tracePath(configData.start);

    // Check if the forward route already reaches the goal.
    if (forwardRoute[forwardRoute.length - 1] == configData.end) {
        console.log("0"); // Output "0" if already at the goal.
        return; // Exit the program.
    }

    // Calculate the route from the goal backwards.
    var goalRoute = reverseTracePath(configData.end);

    // Iterate through the steps to find a potential modification point.
    for (var stepIndex = 0; stepIndex < configData.steps; stepIndex++) {
        // Check if the paths are adjacent and there's no bar between them at this step.
        if (Math.abs(forwardRoute[stepIndex] - goalRoute[stepIndex]) == 1 &&
            gridMatrix[stepIndex][forwardRoute[stepIndex]] == 0 &&
            gridMatrix[stepIndex][goalRoute[stepIndex]] == 0) {
            // If conditions met, form the output string.
            finalOutput = (stepIndex + 1) + " " + (Math.min(forwardRoute[stepIndex], goalRoute[stepIndex]) + 1);
            break; // Stop searching once a point is found.
        }
    }

    // If no modification point was found, default output to "1".
    if (finalOutput == "") {
        finalOutput = "1";
    }

    // Print the final result to the console.
    console.log(finalOutput);
});
