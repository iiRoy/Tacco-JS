function ProcessInputGrid(inputData) {
    // Split the entire input string into individual lines.
    inputData = inputData.split("\n");

    // Parse the grid dimensions from the first line.
    var dimensionsString = inputData[0].split(" ");
    var gridHeight = Number(dimensionsString[0]);
    var gridWidth = Number(dimensionsString[1]);

    // Initialize the queue for BFS and the 2D grid array.
    // The queue will store coordinates of currently "black" cells.
    var currentBlackCells = [];
    // The gridState represents the map, initialized with placeholder values.
    var gridState = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null));

    // Populate the gridState and initial black cells queue.
    // Iterate through each row of the input, starting from the second line.
    for (var rowIndex = 1; rowIndex <= gridHeight; rowIndex++) {
        // Split the current line into characters to form a row in the grid.
        gridState[rowIndex - 1] = inputData[rowIndex].split("");
        // Iterate through each column in the current row.
        for (var colIndex = 0; colIndex < gridWidth; colIndex++) {
            // If a cell is marked as '#', it's an initial black cell.
            if (gridState[rowIndex - 1][colIndex] === "#") {
                // Add its coordinates to the queue.
                currentBlackCells.push([rowIndex - 1, colIndex]);
            }
        }
    }
    
    // Initialize a counter for the number of spreading iterations.
    var spreadIterations = 0;

    // Perform a Breadth-First Search (BFS) to simulate the spreading.
    // Continue as long as there are black cells to process in the current iteration.
    while (currentBlackCells.length > 0) {
        // Increment the iteration counter for each "time step" of spreading.
        spreadIterations++;
        // Create a new queue for cells that will become black in the next iteration.
        // This ensures all cells from the current iteration spread simultaneously.
        var nextSpreadQueue = currentBlackCells.concat();

        // Process all black cells from the current iteration.
        for (var queuePointer = 0; queuePointer < currentBlackCells.length; queuePointer++) {
            // Dequeue a cell's coordinates from the temporary queue.
            var cellCoordinates = nextSpreadQueue.shift();
            var currentYCoord = cellCoordinates[0];
            var currentXCoord = cellCoordinates[1];

            // Check and spread to adjacent cells (up, down, left, right).

            // Check the cell below (y + 1).
            if (currentYCoord + 1 < gridHeight) { // Ensure within vertical bounds.
                if (gridState[currentYCoord + 1][currentXCoord] === ".") { // If it's a white cell.
                    gridState[currentYCoord + 1][currentXCoord] = "#"; // Turn it black.
                    nextSpreadQueue.push([currentYCoord + 1, currentXCoord]); // Add to next iteration's queue.
                }
            }
            // Check the cell above (y - 1).
            if (currentYCoord - 1 >= 0) { // Ensure within vertical bounds.
                if (gridState[currentYCoord - 1][currentXCoord] === ".") { // If it's a white cell.
                    gridState[currentYCoord - 1][currentXCoord] = "#"; // Turn it black.
                    nextSpreadQueue.push([currentYCoord - 1, currentXCoord]); // Add to next iteration's queue.
                }
            }
            // Check the cell to the right (x + 1).
            if (currentXCoord + 1 < gridWidth) { // Ensure within horizontal bounds.
                if (gridState[currentYCoord][currentXCoord + 1] === ".") { // If it's a white cell.
                    gridState[currentYCoord][currentXCoord + 1] = "#"; // Turn it black.
                    nextSpreadQueue.push([currentYCoord, currentXCoord + 1]); // Add to next iteration's queue.
                }
            }
            // Check the cell to the left (x - 1).
            if (currentXCoord - 1 >= 0) { // Ensure within horizontal bounds.
                if (gridState[currentYCoord][currentXCoord - 1] === ".") { // If it's a white cell.
                    gridState[currentYCoord][currentXCoord - 1] = "#"; // Turn it black.
                    nextSpreadQueue.push([currentYCoord, currentXCoord - 1]); // Add to next iteration's queue.
                }
            }
        }

        // Update the main queue for the next iteration with the newly blackened cells.
        currentBlackCells = nextSpreadQueue.concat();
    }
    // The problem asks for the number of minutes, which is one less than the total iterations.
    console.log(spreadIterations - 1);
}

// Read input from standard input and pass it to the main processing function.
ProcessInputGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
