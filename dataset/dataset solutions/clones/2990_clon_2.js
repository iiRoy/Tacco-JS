/* This function processes a grid-based problem where '#' spreads to '.' cells.
   It simulates a breadth-first search (BFS) propagation. */
function ProcessGridData(rawInputStrings)
{

    // Split the entire input string into an array of individual lines.
    rawInputStrings = rawInputStrings.split("\n");

    // The first line contains grid dimensions (Height and Width).
    var dimensionsString = rawInputStrings[0].split(" ");

    // Parse the height and width from the first line.
    var gridHeight = parseInt(dimensionsString[0], 10);
    var gridWidth  = parseInt(dimensionsString[1], 10);

    // Initialize the BFS queue with starting '#' cells and a 2D array representing the grid state.
    var propagationQueue = [];
    var mapGrid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0)); // Initialize 2D array

    // Populate the grid and identify initial source points for propagation.
    // Loop through each input line representing a row in the grid.
    for ( let rowIdx = 1; rowIdx <= gridHeight; rowIdx++ )
    {
        // Convert the current input line string into an array of characters for the grid row.
        mapGrid[rowIdx - 1] = rawInputStrings[rowIdx].split("");

        // Iterate through each character in the current row.
        for ( let colIdx = 0; colIdx < gridWidth; colIdx++ )
        {
            // If a cell contains a '#' character, it's an initial propagation source.
            if (mapGrid[rowIdx - 1][colIdx] === "#") {
                // Add its coordinates to the propagation queue.
                propagationQueue.push([rowIdx - 1, colIdx]);
            }
        }
    }

    // Initialize a counter for the number of propagation steps (time elapsed).
    let propagationSteps = 0;

    // Perform the propagation simulation using BFS.
    // Continue as long as there are cells to propagate from.
    while (propagationQueue.length > 0)
    {
        // Increment the step counter for each level of BFS.
        propagationSteps++;

        // Create a copy of the current queue to process cells for the current step.
        let nextGenQueue = propagationQueue.slice(); // Using slice() instead of concat() for variety

        // Process all cells that were in the queue at the beginning of this step.
        for ( let itemIdx = 0; itemIdx < propagationQueue.length; itemIdx++ )
        {
            // Get the coordinates of the current cell to process.
            let currentCellCoords = nextGenQueue.shift();
            let currentY = currentCellCoords[0];
            let currentX = currentCellCoords[1];

            // Check and propagate to adjacent cells (up, down, left, right).

            // Check cell below current cell.
            if ( (currentY + 1 >= 0) && (currentY + 1 < gridHeight) )
            {
                if (mapGrid[currentY + 1][currentX] === ".")
                {
                    mapGrid[currentY + 1][currentX] = "#"; // Mark as propagated
                    nextGenQueue.push([currentY + 1, currentX]); // Add to next propagation wave
                }
            }

            // Check cell above current cell.
            if ( (currentY - 1 >= 0) && (currentY - 1 < gridHeight) )
            {
                if (mapGrid[currentY - 1][currentX] === ".")
                {
                    mapGrid[currentY - 1][currentX] = "#"; // Mark as propagated
                    nextGenQueue.push([currentY - 1, currentX]); // Add to next propagation wave
                }
            }

            // Check cell to the right of current cell.
            if ( (currentX + 1 >= 0) && (currentX + 1 < gridWidth) )
            {
                if (mapGrid[currentY][currentX + 1] === ".")
                {
                    mapGrid[currentY][currentX + 1] = "#"; // Mark as propagated
                    nextGenQueue.push([currentY, currentX + 1]); // Add to next propagation wave
                }
            }

            // Check cell to the left of current cell.
            if ( (currentX - 1 >= 0) && (currentX - 1 < gridWidth) )
            {
                if (mapGrid[currentY][currentX - 1] === ".")
                {
                    mapGrid[currentY][currentX - 1] = "#"; // Mark as propagated
                    nextGenQueue.push([currentY, currentX - 1]); // Add to next propagation wave
                }
            }
        }

        // Update the main queue for the next BFS level.
        propagationQueue = nextGenQueue.slice();
    }

    // The problem likely requires the number of steps *before* the last propagation,
    // so we subtract one from the total propagation steps.
    console.log(propagationSteps - 1);
}

// Read input from standard input and pass it to the main processing function.
ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));