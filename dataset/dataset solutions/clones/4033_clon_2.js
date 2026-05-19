'use strict';

/**
 * Processes the input string to solve a maze-like problem.
 * @param {string} inputData The raw input string, typically from stdin.
 */
function processInput(inputData) {
  // Split the entire input into individual lines.
  inputData = inputData.split('\n');

  // Parse grid dimensions from the first line.
  const dimensions = inputData[0].split(' ');
  const numRows = Number(dimensions[0]); // Number of rows in the grid.
  const numCols = Number(dimensions[1]); // Number of columns in the grid.

  // Define starting coordinates (top-left).
  const startRow = 0;
  const startCol = 0;

  // Define goal coordinates (bottom-right).
  const goalRow = numRows - 1;
  const goalCol = numCols - 1;

  // Create the grid map from input lines, excluding the first and last (empty line).
  const gridMap = inputData.slice(1, -1).map(lineStr => lineStr.split(''));

  // Initialize a matrix to store minimum distances, filled with a placeholder.
  const distanceMatrix = Array.from({
    length: numRows
  }, () => Array.from({
    length: numCols
  }).fill('*'));

  // Define row and column changes for 4-directional movement (right, down, left, up).
  const deltaRows = [0, 1, 0, -1];
  const deltaCols = [1, 0, -1, 0];

  /**
   * Performs a Breadth-First Search to find the shortest path.
   * @returns {number|string} The shortest path length or '*' if no path exists.
   */
  const findShortestPath = () => {
    const pathQueue = []; // Queue for BFS.

    // Start BFS from the initial position.
    pathQueue.push([startRow, startCol]);
    distanceMatrix[startRow][startCol] = 1; // Distance to start is 1.

    // Continue as long as there are positions to explore.
    while (pathQueue.length > 0) {
      const currentPos = pathQueue.shift(); // Get the next position from the queue.

      // If the goal is reached, we can stop.
      if (currentPos[0] === goalRow && currentPos[1] === goalCol) {
        break;
      }

      // Explore all four possible directions.
      for (let directionIdx = 0; directionIdx < 4; directionIdx++) {
        const nextRow = currentPos[0] + deltaRows[directionIdx];
        const nextCol = currentPos[1] + deltaCols[directionIdx];

        // Check boundary conditions.
        if (nextRow < 0 || numRows <= nextRow) continue;
        if (nextCol < 0 || numCols <= nextCol) continue;

        // Check if the next cell is an obstacle.
        if (gridMap[nextRow][nextCol] === '#') continue;

        // Check if this cell has already been visited with a shorter or equal path.
        if (distanceMatrix[nextRow][nextCol] !== '*') continue;

        // Add the new position to the queue and update its distance.
        pathQueue.push([nextRow, nextCol]);
        distanceMatrix[nextRow][nextCol] = distanceMatrix[currentPos[0]][currentPos[1]] + 1;
      }
    }

    // Return the distance to the goal cell.
    return distanceMatrix[goalRow][goalCol];
  };

  /**
   * Counts the total number of empty cells ('.') in the grid.
   * @returns {number} The total count of empty cells.
   */
  const countEmptyCells = () => {
    return gridMap
      .map(lineStr => lineStr.filter(cellChar => cellChar === '.').length) // Count '.' in each row.
      .reduce((accumulator, currentValue) => accumulator + currentValue); // Sum counts from all rows.
  };

  let finalResult = 0; // Variable to store the final answer.
  const pathLength = findShortestPath(); // Execute BFS to get the shortest path.

  // Determine the final result based on whether a path was found.
  if (pathLength === '*') {
    finalResult = -1; // No path found.
  } else {
    // Calculate the number of empty cells not part of the shortest path.
    finalResult = countEmptyCells() - pathLength;
  }

  // Output the calculated result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
