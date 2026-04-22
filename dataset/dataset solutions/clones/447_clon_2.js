// This function serves as the central processing unit for the application logic.
function mainProcessor( ) {
  let
  // Index used to traverse through the raw input lines.
  lineIndex = 0,
  // Iterators for grid rows and columns.
  rowIterator, currentYCoord, currentXCoord,
  // Stores the width and height of the current grid.
  gridDimensions,
  // The 2D array representing the grid of cell types.
  gridMatrix,
  // A map storing the number of paths reaching each cell coordinate.
  pathCounts = {},
  // A special row appended to the grid to handle boundary conditions.
  boundaryRow = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

  // An indefinite loop to process multiple grid configurations.
  // It terminates when a specific input condition is met.
  for ( ; ; ) {
    // Parse the grid dimensions from the input data.
    gridDimensions = rawInputData[lineIndex++].split(' ').map(Number);
    gridMatrix = []; // Initialize the grid for the current scenario.

    // Check for the termination signal (0 0 dimensions).
    if (gridDimensions[0] === 0 && gridDimensions[1] === 0) {
      break;
    }

    // Populate the grid matrix with cell data.
    for (rowIterator = 0; rowIterator < gridDimensions[1]; rowIterator++) {
      gridMatrix.push(rawInputData[lineIndex++].split(' ').map(Number));
    }
    gridMatrix.push(boundaryRow); // Append the boundary row for path calculation.

    let totalPaths = 0; // Reset the total path count for the new grid.
    pathCounts = {}; // Clear previously stored path counts.

    // Initialize the path counts for the first row based on cell type 0.
    for (currentXCoord = 0; currentXCoord < gridDimensions[0]; currentXCoord++) {
      pathCounts[[currentXCoord, 0]] = gridMatrix[0][currentXCoord] === 0 ? 1 : 0;
    }

    // Iterate through the grid to calculate path counts for each cell.
    for (currentYCoord = 0; currentYCoord < gridDimensions[1]; currentYCoord++) {
      for (currentXCoord = 0; currentXCoord < gridDimensions[0]; currentXCoord++) {
        // Ensure the current cell's path count is at least 0.
        pathCounts[[currentXCoord, currentYCoord]] = pathCounts[[currentXCoord, currentYCoord]] || 0;

        // Apply path logic based on the cell's type.
        switch (gridMatrix[currentYCoord][currentXCoord]) {
          case 0: // Cell type 0 allows diagonal and direct downward movement.
            // Move to bottom-left if not blocked by a type 2 cell.
            if (gridMatrix[currentYCoord + 1][currentXCoord - 1] !== 2) {
              pathCounts[[currentXCoord - 1, currentYCoord + 1]] = (pathCounts[[currentXCoord - 1, currentYCoord + 1]] || 0) + pathCounts[[currentXCoord, currentYCoord]];
            }
            // Move directly downward.
            pathCounts[[currentXCoord, currentYCoord + 1]] = (pathCounts[[currentXCoord, currentYCoord + 1]] || 0) + pathCounts[[currentXCoord, currentYCoord]];
            // Move to bottom-right if not blocked by a type 2 cell.
            if (gridMatrix[currentYCoord + 1][currentXCoord + 1] !== 2) {
              pathCounts[[currentXCoord + 1, currentYCoord + 1]] = (pathCounts[[currentXCoord + 1, currentYCoord + 1]] || 0) + pathCounts[[currentXCoord, currentYCoord]];
            }
            break;
          case 1: // Cell type 1 is a stopper; no paths originate from here.
            break;
          case 2: // Cell type 2 allows a jump of two steps downward.
            pathCounts[[currentXCoord, currentYCoord + 2]] = (pathCounts[[currentXCoord, currentYCoord + 2]] || 0) + pathCounts[[currentXCoord, currentYCoord]];
            break;
        }
      }
    }

    // This line is for debugging and visualizing the path counts, currently inactive.
    // displayGridState(gridDimensions, pathCounts);

    // Aggregate the total paths from the final two rows of the grid.
    for (currentYCoord = gridDimensions[1]; currentYCoord <= gridDimensions[1] + 1; currentYCoord++) {
      for (currentXCoord = 0; currentXCoord < gridDimensions[0]; currentXCoord++) {
        totalPaths += pathCounts[[currentXCoord, currentYCoord]] || 0;
      }
    }

    // Output the final calculated total paths for the current grid.
    console.log(totalPaths);
  }
}


// A utility function intended for debugging to print the state of the grid.
function displayGridState(dimensions, computedValues) {
  let
  columnTracker, rowTracker,
  outputLineSegments; // Array to build each line of output.

  // Loop through each row, including the boundary.
  for (rowTracker = 0; rowTracker <= dimensions[1]; rowTracker++) {
    outputLineSegments = []; // Reset line segments for the new row.
    // Loop through each column in the current row.
    for (columnTracker = 0; columnTracker < dimensions[0]; columnTracker++) {
      // Add the path count (or 0 if none) to the current line's segments.
      outputLineSegments.push(computedValues[[columnTracker, rowTracker]] || 0);
    }
    // Print the collected segments, joined by spaces, to the console.
    console.log(outputLineSegments.join(' '));
  }
}


// Global variable to store all input received from standard input.
let rawInputData = '';

// Create aliases for standard input stream methods to avoid direct 'process.stdin' calls.
const streamActivator = process.stdin.resume.bind(process.stdin);
const encodingSetter = process.stdin.setEncoding.bind(process.stdin);
const eventRegistrar = process.stdin.on.bind(process.stdin);

// Begin processing the input stream.
streamActivator();
// Set the character encoding for the incoming data to UTF-8.
encodingSetter('utf8');

// Register a handler to accumulate data chunks as they arrive.
eventRegistrar('data', function(incomingDataSegment) {
  rawInputData += incomingDataSegment; // Append the new data to our buffer.
});

// Register a handler for when the entire input stream has concluded.
eventRegistrar('end', function() {
  // Once all input is received, split it into an array of lines.
  rawInputData = rawInputData.split('\n');
  // Initiate the main application logic with the prepared input.
  mainProcessor();
});