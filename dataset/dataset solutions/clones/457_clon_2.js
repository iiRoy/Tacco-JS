let rawInputData = ''; // Variable to accumulate all input received from stdin.

// Resume the standard input stream to start receiving data.
process.stdin.resume();

// Specify the character encoding for the incoming data.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events.
// Each time a chunk of data is received, append it to rawInputData.
process.stdin.on('data', function (dataSegment) {
  rawInputData += dataSegment;
});

// Attach an event listener for the 'end' event.
// Once the entire input stream has finished, invoke the main processing routine.
process.stdin.on('end', function () {
  processInputCases(rawInputData);
});

/**
 * Orchestrates the processing of multiple test cases provided in the input.
 * @param {string} fullInputString - The complete string received from standard input.
 */
function processInputCases (fullInputString) {
  // Trim leading/trailing whitespace and split the input into an array of lines.
  const lineFragments = fullInputString.trim().split('\n');

  let caseIterator = 0; // Index to keep track of the current line being processed.

  // Loop indefinitely until a specific termination condition is encountered.
  while (true) {
    const gridMatrix = []; // Represents the 2D game board or map for the current case.

    // Parse the width and height dimensions for the current grid.
    const dimensionsPair = parseNumericTokens(lineFragments[caseIterator++]);

    // Check if the current dimensions indicate the end of input (0 0).
    if (isTerminationSequence(dimensionsPair)) {
      break; // Exit the loop if end-of-input marker is found.
    }

    // Set up the initial empty grid based on the parsed dimensions.
    initializeGridMatrix(dimensionsPair, gridMatrix);

    // Parse the starting coordinates (X, Y) for pathfinding.
    const startCoordinates = parseNumericTokens(lineFragments[caseIterator++]);
    // Parse the target coordinates (X, Y) for pathfinding.
    const targetCoordinates = parseNumericTokens(lineFragments[caseIterator++]);

    // Read the total number of obstacles to be placed on the grid.
    const obstacleQuantity = parseInt(lineFragments[caseIterator++]);

    // Iterate through the specified number of obstacles and place them.
    for (let obstacleIterator = 0; obstacleIterator < obstacleQuantity; obstacleIterator += 1) {
      // Parse the details for the current obstacle (ID, orientation, X, Y).
      const obstacleDetails = parseNumericTokens(lineFragments[caseIterator++]);
      applyObstacleToGrid(gridMatrix, obstacleDetails); // Place the obstacle.
    }

    // Determine if a path exists from the start to the target coordinates.
    // Coordinates are adjusted to be zero-indexed for array access.
    const reachabilityResult = checkConnectivity(
      gridMatrix,
      startCoordinates[0] - 1, startCoordinates[1] - 1,
      targetCoordinates[0] - 1, targetCoordinates[1] - 1
    );

    // Output the result ("OK" if reachable, "NO" otherwise) to the console.
    console.log(reachabilityResult ? "OK" : "NO");
  }
}

/**
 * Creates and initializes a 2D array (grid) with default values (0).
 * @param {number[]} sizeInfo - An array containing [width, height] for the grid.
 * @param {number[][]} targetGrid - The array that will be populated as the grid.
 */
function initializeGridMatrix (sizeInfo, targetGrid) {
  // Loop through each row index.
  for (let rowIdx = 0; rowIdx < sizeInfo[0]; rowIdx += 1) {
    const tempRowArray = []; // Temporary array to build the current row.
    // Loop through each column index for the current row.
    for (let colIdx = 0; colIdx < sizeInfo[1]; colIdx += 1) {
      tempRowArray.push(0); // Add a default value (0) to the cell.
    }
    targetGrid.push(tempRowArray); // Add the completed row to the grid.
  }
}

/**
 * Places a rectangular obstacle on the grid based on its details.
 * @param {number[][]} targetGrid - The grid where the obstacle will be marked.
 * @param {number[]} obstacleDetails - An array: [ID, orientation, startX, startY].
 *                                     Orientation: 0 for horizontal, 1 for vertical.
 */
function applyObstacleToGrid (targetGrid, obstacleDetails) {
  // Determine if the obstacle's primary dimension is horizontal (false for orientation 1 means horizontal).
  const isHorizontallyOriented = !obstacleDetails[1];
  // Set obstacle dimensions based on its orientation.
  const obstacleWidth = isHorizontallyOriented ? 4 : 2;
  const obstacleHeight = isHorizontallyOriented ? 2 : 4;
  // Convert 1-indexed input coordinates to 0-indexed for array access.
  const startR = obstacleDetails[2] - 1;
  const startC = obstacleDetails[3] - 1;

  // Iterate over the cells covered by the obstacle's width.
  for (let currGridRow = startR; currGridRow < startR + obstacleWidth; currGridRow += 1) {
    // Iterate over the cells covered by the obstacle's height.
    for (let currGridCol = startC; currGridCol < startC + obstacleHeight; currGridCol += 1) {
      // Mark the cell with the obstacle's unique identifier.
      targetGrid[currGridRow][currGridCol] = obstacleDetails[0];
    }
  }
}

/**
 * Determines if there is a path of connected cells (sharing the same identifier)
 * from a starting point to a destination point within the grid.
 * Uses a recursive depth-first search approach, marking visited cells.
 * @param {number[][]} currentGrid - The 2D array representing the area.
 * @param {number} currentR - The current row index.
 * @param {number} currentC - The current column index.
 * @param {number} destinationR - The target row index.
 * @param {number} destinationC - The target column index.
 * @returns {boolean} - True if the destination is reachable, false otherwise.
 */
function checkConnectivity (currentGrid, currentR, currentC, destinationR, destinationC) {
  // Base case: If the current position is the destination, a path has been found.
  if (currentR === destinationR && currentC === destinationC) {
    return true;
  }

  // Store the identifier (color/type) of the current cell.
  const cellIdentifier = currentGrid[currentR][currentC];
  // Mark the current cell as visited to prevent infinite loops in recursion.
  currentGrid[currentR][currentC] = -2;

  let pathFound = false; // Flag to track if any path leads to the destination.

  // Iterate through all 8 possible directional offsets (including diagonals).
  [-1, 0, 1].forEach(function (deltaRow) {
    [-1, 0, 1].forEach(function (deltaCol) {
      // Skip the (0,0) offset, as it refers to the current cell itself.
      if (!deltaRow && !deltaCol) {
        return;
      }
      // Calculate the coordinates of the neighboring cell.
      const neighborRow = currentR + deltaRow, neighborCol = currentC + deltaCol;

      // Check if the neighbor is within grid boundaries and has the same identifier.
      // `currentGrid[neighborRow]` checks for valid row access, then `currentGrid[neighborRow][neighborCol]` checks cell content.
      if (currentGrid[neighborRow] && currentGrid[neighborRow][neighborCol] === cellIdentifier) {
        // Recursively call checkConnectivity for the neighbor.
        // Use logical OR assignment to update pathFound if any recursive call returns true.
        pathFound = pathFound || checkConnectivity(currentGrid, neighborRow, neighborCol, destinationR, destinationC);
      }
    });
  });
  return pathFound; // Return the final result of the path search.
}

/**
 * Converts a space-separated string of numbers into an array of numbers.
 * @param {string} inputStringData - The string containing space-separated numeric values.
 * @returns {number[]} - An array of numbers parsed from the input string.
 */
function parseNumericTokens (inputStringData) {
  // Split the string by spaces and then convert each resulting string token to a number.
  return inputStringData.split(' ').map(Number);
}

/**
 * Checks if a given array of two numbers represents the termination condition (both are 0).
 * @param {number[]} testArray - An array, typically containing two numeric values.
 * @returns {boolean} - True if both elements are 0, indicating the end of input.
 */
function isTerminationSequence (testArray) {
  return testArray[0] === 0 && testArray[1] === 0;
}