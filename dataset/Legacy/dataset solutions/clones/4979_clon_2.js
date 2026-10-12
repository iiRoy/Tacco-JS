function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  rawData = rawData.split("\n");

  // Parse the grid dimensions (height and width) from the first line of input.
  // The `-0` converts the string to a number.
  const heightDim = rawData[0].split(" ")[0] - 0;
  const widthDim = rawData[0].split(" ")[1] - 0;

  // Initialize an array to store the counts of cells with 0 to 9 active neighbors.
  // The array size is 10, indexed 0-9.
  var resultCounts = new Array(10);
  // Fill the array with initial zero values.
  resultCounts.fill(0);

  // Calculate the initial number of cells that have zero active neighbors.
  // This is the total number of inner cells (excluding a 1-cell border).
  resultCounts[0] = (heightDim - 2) * (widthDim - 2);

  // If the input contains only the dimension line, print the current counts and exit.
  if (rawData.length === 1) {
    console.log(resultCounts.join("\n"));
    return;
  }

  // Create a 2D boolean grid to represent the state of each cell (active/inactive).
  var gridState = new Array(heightDim);
  for (var rowIdx = 0; rowIdx < heightDim; rowIdx++) {
    gridState[rowIdx] = new Array(widthDim);
    // Initialize all cells in the current row as inactive (false).
    gridState[rowIdx].fill(false);
  }

  // Declare variables for temporary storage during processing.
  var coordsStr;
  var neighborCount;

  // Iterate through the input lines starting from the second line (index 1),
  // as these lines specify the coordinates of cells to be activated.
  for (var rowIdx = 1; rowIdx < rawData.length; rowIdx++) {
    // Split the current line to get the row and column coordinates.
    coordsStr = rawData[rowIdx].split(" ");

    // Adjust the coordinates from 1-indexed (as per problem statement) to 0-indexed.
    [0, 1].forEach(coordPart => {
      coordsStr[coordPart] -= 1;
    });

    // Mark the cell at the specified coordinates as active in the grid.
    gridState[coordsStr[0]][coordsStr[1]] = true;

    // Iterate through a 3x3 neighborhood around the newly activated cell.
    // deltaRow and deltaCol represent offsets from the activated cell's coordinates.
    [-1, 0, 1].forEach(deltaRow => {
      [-1, 0, 1].forEach(deltaCol => {
        // Check if the center of the current 3x3 neighborhood (coordsStr[0]+deltaRow, coordsStr[1]+deltaCol)
        // is within the valid inner grid boundaries (excluding the outermost 1-cell border).
        if (
          1 <= deltaRow + coordsStr[0] &&
          deltaRow + coordsStr[0] < heightDim - 1 &&
          1 <= deltaCol + coordsStr[1] &&
          deltaCol + coordsStr[1] < widthDim - 1
        ) {
          // Reset the neighbor count for this specific 3x3 neighborhood center.
          neighborCount = 0;

          // Count the number of active cells within the 3x3 area centered at
          // (coordsStr[0] + deltaRow, coordsStr[1] + deltaCol).
          [-1, 0, 1].forEach(subDeltaRow => {
            [-1, 0, 1].forEach(subDeltaCol => {
              // If the cell is active, increment the neighbor count.
              neighborCount += gridState[coordsStr[0] + deltaRow + subDeltaRow][coordsStr[1] + deltaCol + subDeltaCol] ? 1 : 0;
            });
          });

          // When a cell becomes active, it changes the neighbor count for its surrounding 3x3 areas.
          // The cell at (coordsStr[0] + deltaRow, coordsStr[1] + deltaCol) previously had
          // (neighborCount - 1) active neighbors (before the current cell was activated).
          // So, decrement the count for (neighborCount - 1) neighbors.
          resultCounts[neighborCount - 1]--;
          // Now, this cell has 'neighborCount' active neighbors, so increment that count.
          resultCounts[neighborCount]++;
        }
      });
    });
  }

  // After processing all activated cells, print the final counts, each on a new line.
  console.log(resultCounts.join("\n"));
}

// The following line is for standard input/output handling and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
