var rawDataBuffer = '';

// Begin standard input handling
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Accumulate incoming data chunks
process.stdin.on('data', function(dataChunk) {
    rawDataBuffer += dataChunk;
});

// Process all accumulated data when input ends
process.stdin.on('end', function() {
    // Split the buffered data into an array of lines
    var rawData = rawDataBuffer.split('\n');
    // Invoke the primary processing routine
    processGridData(rawData);
});

/**
 * Main function to process a series of grid puzzles.
 * Each puzzle defines a grid and a path, determining if it loops.
 * @param {Array<string>} inputData An array of strings representing the input lines.
 */
function processGridData(inputData) {
    // Declare all necessary local variables at the beginning
    var
        // Loop counters for iterating through input and grid cells
        rowIterator, colIterator,
        // Dimensions of the current grid
        gridWidth, gridHeight,
        // Current coordinates of the "pointer" moving through the grid
        currentYCoord, currentXCoord,
        // Holds the split line data from input
        currentLineData,
        // Stores visited cells to detect loops
        visitedCellsMap,
        // The 2D array representing the grid structure
        gridMatrix,
        // Flag to indicate if a cycle has been detected
        hasCycleDetected,
        // Total number of input lines
        inputDataLength = inputData.length;

    // Iterate through each puzzle definition in the input data
    for (rowIterator = 0; rowIterator < inputDataLength; ++rowIterator) {
        // Split the current line by space to get width and height
        currentLineData = inputData[rowIterator].split(' ');
        gridWidth = parseInt(currentLineData[0], 10);
        gridHeight = parseInt(currentLineData[1], 10);

        // Check for the termination condition (0 0)
        if (gridWidth === 0 && gridHeight === 0) {
            break;
        }

        // Initialize grid and visited cell tracker for the new puzzle
        gridMatrix = [];
        visitedCellsMap = {};

        // Populate the grid matrix with subsequent input lines
        for (colIterator = 0; colIterator < gridHeight; ++colIterator) {
            gridMatrix[colIterator] = inputData[++rowIterator]; // Increment main iterator to read grid rows
        }

        // Initialize starting position and loop detection flag for the path traversal
        currentYCoord = 0;
        currentXCoord = 0;
        hasCycleDetected = false;

        // Traverse the grid until an exit point ('.') is reached or a loop is detected
        while (gridMatrix[currentYCoord].charAt(currentXCoord) !== '.') {
            // Mark the current cell as visited
            visitedCellsMap[[currentYCoord, currentXCoord]] = true;

            // Determine the next move based on the character in the current cell
            switch (gridMatrix[currentYCoord].charAt(currentXCoord)) {
                case '>': // Move right
                    currentXCoord += 1;
                    break;
                case '<': // Move left
                    currentXCoord -= 1;
                    break;
                case 'v': // Move down
                    currentYCoord += 1;
                    break;
                case '^': // Move up
                    currentYCoord -= 1;
                    break;
            }

            // After moving, check if the new cell has already been visited
            if (visitedCellsMap[[currentYCoord, currentXCoord]] === true) {
                hasCycleDetected = true; // A loop is detected
                break; // Exit the traversal loop
            }
        }

        // Output the result: 'LOOP' if a cycle was found, otherwise the final coordinates
        console.log(hasCycleDetected ? 'LOOP' : [currentXCoord, currentYCoord].join(' '));
    }
}