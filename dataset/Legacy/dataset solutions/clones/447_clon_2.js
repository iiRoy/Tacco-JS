function processGridData() {
  // This variable tracks the current line being read from the input buffer.
  let currentLineIdx = 0;
  // Variables for iterating through grid rows and columns.
  let rowIndex, gridRowCoord, gridColCoord;
  // Stores the dimensions [width, height] of the current grid.
  let gridDimensions;
  // A 2D array representing the layout of the grid cells.
  let gridLayout = [];
  // An object to store the calculated number of distinct paths to each cell coordinate.
  let pathwayCounts = {};
  // A constant row used as a boundary or padding, filled with the value '2'.
  const boundaryRow = Array(15).fill(2);

  // The main processing loop continues until a specific termination condition is met.
  for (;;) {
    // Read the grid's width and height from the input buffer.
    // The values are parsed as floating-point numbers.
    gridDimensions = rawInputBuffer[currentLineIdx++].split(' ').map(parseFloat);
    // Reset the grid layout for the new set of dimensions.
    gridLayout = [];

    // Check if both dimensions are zero, which signals the end of input.
    if (gridDimensions[0] === 0 && gridDimensions[1] === 0) {
      break; // Exit the infinite loop.
    }
    
    // Populate the gridLayout with cell data for each row.
    for (rowIndex = 0; rowIndex < gridDimensions[1]; rowIndex++) {
      gridLayout.push(rawInputBuffer[currentLineIdx++].split(' ').map(parseFloat));
    }
    // Append the predefined boundary row to the grid layout.
    gridLayout.push(boundaryRow);
    
    // Initialize the total path sum for the current grid configuration.
    let finalPathSum = 0;
    // Clear the pathway counts from the previous grid.
    pathwayCounts = {};

    // Initialize path counts for the very first row (gridRowCoord = 0).
    // A cell with value 0 in the first row is considered a starting point with 1 path.
    for (gridColCoord = 0; gridColCoord < gridDimensions[0]; gridColCoord++) {
      pathwayCounts[[gridColCoord, 0]] = gridLayout[0][gridColCoord] === 0 ? 1 : 0;
    }

    // Iterate through each cell of the grid to calculate path propagation.
    for (gridRowCoord = 0; gridRowCoord < gridDimensions[1]; gridRowCoord++) {
      for (gridColCoord = 0; gridColCoord < gridDimensions[0]; gridColCoord++) {
        // Ensure the current cell's path count is initialized to zero if it hasn't been reached yet.
        pathwayCounts[[gridColCoord, gridRowCoord]] = pathwayCounts[[gridColCoord, gridRowCoord]] || 0;

        // Apply different path-finding rules based on the cell's type.
        switch (gridLayout[gridRowCoord][gridColCoord]) {
          case 0: // Cell type 0: Paths can move to adjacent cells in the next row.
            // Propagate paths to the bottom-left cell, if it's not a blocker (value 2).
            if (gridLayout[gridRowCoord + 1][gridColCoord - 1] !== 2) {
              pathwayCounts[[gridColCoord - 1, gridRowCoord + 1]] = (pathwayCounts[[gridColCoord - 1, gridRowCoord + 1]] || 0) + pathwayCounts[[gridColCoord, gridRowCoord]];
            }
            // Propagate paths directly downwards.
            pathwayCounts[[gridColCoord, gridRowCoord + 1]] = (pathwayCounts[[gridColCoord, gridRowCoord + 1]] || 0) + pathwayCounts[[gridColCoord, gridRowCoord]];
            // Propagate paths to the bottom-right cell, if it's not a blocker (value 2).
            if (gridLayout[gridRowCoord + 1][gridColCoord + 1] !== 2) {
              pathwayCounts[[gridColCoord + 1, gridRowCoord + 1]] = (pathwayCounts[[gridColCoord + 1, gridRowCoord + 1]] || 0) + pathwayCounts[[gridColCoord, gridRowCoord]];
            }
            break;
          case 1: // Cell type 1: This cell acts as a dead end; no paths propagate from it.
            break;
          case 2: // Cell type 2: Paths from this cell jump two rows down.
            pathwayCounts[[gridColCoord, gridRowCoord + 2]] = (pathwayCounts[[gridColCoord, gridRowCoord + 2]] || 0) + pathwayCounts[[gridColCoord, gridRowCoord]];
            break;
        }
      }
    }

    // The following line was commented out in the original code, likely for debugging.
    // visualizeGridState(gridDimensions, pathwayCounts);

    // Sum up the path counts for the last two rows of the grid.
    // These represent paths that have successfully traversed the grid.
    for (gridRowCoord = gridDimensions[1]; gridRowCoord <= gridDimensions[1] + 1; gridRowCoord++) {
      for(gridColCoord = 0; gridColCoord < gridDimensions[0]; gridColCoord++) {
        finalPathSum += pathwayCounts[[gridColCoord, gridRowCoord]] || 0;
      }
    }

    // Output the calculated total number of paths for the current grid.
    console.log(finalPathSum);
  }
}

// This utility function is designed for visualizing the state of path counts on the grid.
// It was commented out in the original source, indicating it's for debugging purposes.
function visualizeGridState(gridDimensions, pathwayCounts) {
  let gridColCoord, gridRowCoord;
  let outputRow; // An array to build each row's string representation.

  // Iterate through each row of the grid, including the boundary row.
  for (gridRowCoord = 0; gridRowCoord <= gridDimensions[1]; gridRowCoord++) {
    outputRow = []; // Reset the row for new values.
    // Iterate through each column.
    for (gridColCoord = 0; gridColCoord < gridDimensions[0]; gridColCoord++) {
      // Add the path count for the current cell, defaulting to 0 if not present.
      outputRow.push(pathwayCounts[[gridColCoord, gridRowCoord]] || 0);
    }
    // Print the row's path counts, separated by spaces.
    console.log(outputRow.join(' '));
  }
}

// A string variable to accumulate all incoming data from standard input.
let rawInputBuffer = '';

// Configure standard input to resume and use UTF-8 encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks from stdin.
process.stdin.on('data', function(dataChunk) {
  rawInputBuffer += dataChunk; // Append the chunk to the buffer.
});

// Event listener for when all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated input string into an array of lines.
  rawInputBuffer = rawInputBuffer.split('\n');
  // Initiate the main grid processing logic.
  processGridData();
});
