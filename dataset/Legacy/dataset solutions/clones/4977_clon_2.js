function ProcessInputData(rawInputData) {
  // Split the entire input string into an array of lines.
  rawInputData = rawInputData.split("\n");

  // Parse grid dimensions (height and width) from the first line.
  // The `-0` converts the string parts to numbers.
  const gridRows = rawInputData[0].split(" ")[0] - 0;
  const gridCols = rawInputData[0].split(" ")[1] - 0;

  // Initialize an array to store the counts of 3x3 subgrids
  // based on the number of black cells they contain (from 0 to 9).
  // The array size 10 accommodates indices 0 through 9.
  let countResults = new Array(10);
  // Fill the array with initial zero counts.
  countResults.fill(0);

  // Calculate the initial count of 3x3 subgrids that contain zero black cells.
  // This is the total number of possible 3x3 subgrids in the grid.
  // A 3x3 subgrid can have its top-left corner at (r, c) where 0 <= r <= H-3 and 0 <= c <= W-3.
  countResults[0] = (gridRows - 2) * (gridCols - 2);

  // If the input contains only the grid dimensions and no black cell coordinates,
  // then only the count for zero black cells is relevant.
  if (rawInputData.length === 1) {
    console.log(countResults.join("\n"));
    return; // Exit the function early.
  }

  // Create a 2D boolean array to represent the grid state.
  // `true` indicates a black cell, `false` indicates a white cell.
  let blackCellGrid = new Array(gridRows);
  for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
    blackCellGrid[rowIndex] = new Array(gridCols);
    blackCellGrid[rowIndex].fill(false); // Initially, all cells are white.
  }

  // Variables to temporarily hold parsed coordinates and the count of black neighbors.
  let parsedCoords;
  let blackNeighborCount;

  // Iterate through each line of input starting from the second line (index 1),
  // as these lines specify the coordinates of cells that turn black.
  for (let dataLineIndex = 1; dataLineIndex < rawInputData.length; dataLineIndex++) {
    // Split the current line to get the row and column of the black cell.
    parsedCoords = rawInputData[dataLineIndex].split(" ");

    // Adjust the coordinates to be 0-indexed (input is 1-indexed).
    [0, 1].forEach(coordComponentIndex => {
      parsedCoords[coordComponentIndex] -= 1;
    });

    // Mark the specified cell as black in our grid.
    blackCellGrid[parsedCoords[0]][parsedCoords[1]] = true;

    // Now, update the counts for all 3x3 subgrids that are affected by this newly black cell.
    // A newly black cell at (r, c) affects any 3x3 subgrid that contains it.
    // This means we consider all 3x3 subgrids whose *center* is within the 3x3 neighborhood
    // of the newly black cell (including the cell itself as a center).
    [-1, 0, 1].forEach(rowOffset => {
      [-1, 0, 1].forEach(colOffset => {
        // Calculate the potential center (centerR, centerC) of a 3x3 subgrid.
        const centerR = parsedCoords[0] + rowOffset;
        const centerC = parsedCoords[1] + colOffset;

        // Check if this potential 3x3 subgrid (centered at centerR, centerC)
        // is entirely within the bounds of the main grid.
        // A 3x3 subgrid centered at (R, C) spans from (R-1, C-1) to (R+1, C+1).
        // So, R-1 must be >= 0, R+1 must be < gridRows, C-1 must be >= 0, C+1 must be < gridCols.
        // This simplifies to 1 <= R < gridRows-1 and 1 <= C < gridCols-1.
        if (
          1 <= centerR && centerR < gridRows - 1 &&
          1 <= centerC && centerC < gridCols - 1
        ) {
          blackNeighborCount = 0; // Reset count for the current 3x3 subgrid.

          // Iterate through the 3x3 cells of this subgrid to count black cells.
          [-1, 0, 1].forEach(subRowOffset => {
            [-1, 0, 1].forEach(subColOffset => {
              // Add 1 to the count if the cell is black, 0 otherwise.
              blackNeighborCount += blackCellGrid[centerR + subRowOffset][centerC + subColOffset] ? 1 : 0;
            });
          });

          // When a cell turns black, the count of black cells in this specific 3x3 subgrid changes.
          // Before the current cell turned black, this subgrid had `blackNeighborCount - 1` black cells.
          // So, we decrement the count for that previous state.
          countResults[blackNeighborCount - 1]--;
          // After the current cell turned black, this subgrid now has `blackNeighborCount` black cells.
          // So, we increment the count for this new state.
          countResults[blackNeighborCount]++;
        }
      });
    });
  }

  // Output the final counts, with each count on a new line.
  console.log(countResults.join("\n"));
}

// The following line is responsible for reading input from standard input
// and passing it to the main processing function. It should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
